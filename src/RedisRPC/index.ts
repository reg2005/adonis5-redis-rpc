import Redis from '@ioc:Adonis/Addons/Redis'
import { RPCMessageRequest, RPCMessageResponse } from '@ioc:Adonis/Addons/RedisRPC'
import Event, { EmitterContract } from '@ioc:Adonis/Core/Event'
import { serializeError, deserializeError } from 'serialize-error'

import { v4 } from 'uuid'
const serverDebug = require('debug')('adonis:addons:RedisRPC')
const clientDebug = require('debug')('adonis:addons:RedisRPC')
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export class RedisRPC {
  constructor(private redis: typeof Redis, protected event: typeof Event) {}
  public timeout = 5000
  public clientId = v4()
  private handlers: { [key: string]: (params: any) => Promise<any> | any } = {}
  public server(serverName: string) {
    this.redis.subscribe(`rpc:MAIN:request:${serverName}`, async (message: string) => {
      const parsedMessage: RPCMessageRequest = JSON.parse(message)
      serverDebug('parsedMessage', parsedMessage)
      let result: any = null
      let error = false
      try {
        result = await this.handlers[parsedMessage.methodName](parsedMessage.params)
      } catch (e) {
        serverDebug(`RPC server method ${parsedMessage.methodName} error`, e)
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
    })
    return sleep(100)
  }
  public addHandler<T>(methodName: string, cb: (data: any) => Promise<T> | T) {
    this.handlers[methodName] = cb
  }
  public removeHandler(methodName: string) {
    delete this.handlers[methodName]
  }
  public client() {
    this.redis.subscribe(`rpc:MAIN:client:${this.clientId}`, (message) => {
      const parsedMessage: RPCMessageResponse = JSON.parse(message)
      clientDebug('parsedMessage', parsedMessage)
      this.event.emit(`rpc:response:${parsedMessage.uuid}`, parsedMessage)
    })
    return sleep(100)
  }
  public call<T>(methodName: string, params: any = [], options?: { timeout: number }): Promise<T> {
    const uuid = v4()

    let [service, method] = methodName.split('.')

    if (!service) throw new Error('Service name is required')

    let unsubscribe: EmitterContract | null = null
    const promise = Promise.race([
      new Promise<T>((resolve, reject) => {
        unsubscribe = this.event.on(
          `rpc:response:${uuid}`,
          (message: { error: boolean; result: any }) => {
            clientDebug('rpc response', message)
            const { error, result } = message
            if (error) return reject(deserializeError(error))
            resolve(result)
          }
        )
      }),
      sleep(options?.timeout || this.timeout).then(() => {
        throw new Error('RPC request timeout')
      }),
    ]).finally(unsubscribe)

    this.redis.publish(
      `rpc:MAIN:request:${service}`,
      JSON.stringify({
        methodName: method,
        params,
        uuid,
        clientId: this.clientId,
      } as RPCMessageRequest)
    )

    return promise
  }
}
