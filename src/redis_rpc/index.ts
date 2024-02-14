import adonisjsRedis from '@adonisjs/redis/services/main'
import { v4 } from 'uuid'
import type { Logger } from '@adonisjs/core/logger'
import { Emitter } from '@adonisjs/core/events'
import { type UnsubscribeFunction } from 'emittery'
import { serializeError, deserializeError } from 'serialize-error'
import * as errors from '../errors.js'
import {
  RPCMessageRequest,
  RPCMessageResponse,
  RedisRPCContract,
  RedisRPCEvents,
} from '../types.js'

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export class RedisRPC implements RedisRPCContract {
  constructor(
    private redis: typeof adonisjsRedis,
    protected event: Emitter<RedisRPCEvents>,
    private logger: Logger
  ) {}
  #timeout = 5000
  #clientId = v4()
  serverId: string | null = null
  #handlers: { [key: string]: (params: any) => Promise<any> | any } = {}
  async server(serverId: string | null = null) {
    this.serverId = serverId
    this.redis.subscribe(
      `rpc:MAIN:request${this.serverId ? `:${this.serverId}` : ''}`,
      async (message: string) => {
        const parsedMessage: RPCMessageRequest = JSON.parse(message)
        let result: any = null
        let error = false
        try {
          result = await this.#handlers[parsedMessage.methodName](parsedMessage.params)
        } catch (e) {
          this.logger.error(e, `RPC server method ${parsedMessage.methodName} error`)
          error = serializeError(e)
        }
        await this.redis.publish(
          `rpc:MAIN:client:${parsedMessage.clientId}`,
          JSON.stringify({
            ...parsedMessage,
            error,
            result,
          } as RPCMessageResponse)
        )
      }
    )
    sleep(100)
  }
  addHandler<T>(methodName: string, cb: (data: any) => Promise<T> | T) {
    this.#handlers[methodName] = cb
  }
  removeHandler(methodName: string) {
    delete this.#handlers[methodName]
  }
  async client() {
    this.redis.subscribe(`rpc:MAIN:client:${this.#clientId}`, (message) => {
      const parsedMessage: RPCMessageResponse = JSON.parse(message)
      this.event.emit(`rpc:response:${parsedMessage.uuid}`, parsedMessage)
    })
    await sleep(100)
  }
  call<T>(methodName: string, params: any = [], options?: { timeout: number }): Promise<T> {
    const uuid = v4()

    let serverId: string | undefined = methodName.split('.')[0]
    let method = methodName.split('.')[1]

    if (!method) {
      method = serverId
      serverId = undefined
    }

    let unsubscribe: UnsubscribeFunction | null = null
    const promise = Promise.race([
      new Promise<T>((resolve, reject) => {
        unsubscribe = this.event.on(
          `rpc:response:${uuid}`,
          (message: { error: boolean; result: any }) => {
            const { error, result } = message
            if (error) return reject(deserializeError(error))
            resolve(result)
          }
        )
      }),
      sleep(options?.timeout || this.#timeout).then(() => {
        throw new errors.E_REQUEST_TIMEOUT([method])
      }),
    ]).finally(unsubscribe)

    this.redis.publish(
      `rpc:MAIN:request${serverId ? `:${serverId}` : ''}`,
      JSON.stringify({
        methodName: method,
        params,
        uuid,
        clientId: this.#clientId,
      } as RPCMessageRequest)
    )

    return promise
  }
}
