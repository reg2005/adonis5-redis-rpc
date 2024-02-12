import type { RedisOptions, ClusterOptions } from 'ioredis'

export interface RPCMessageRequest {
  uuid: string
  methodName: string
  params: []
  clientId: string
}
export interface RPCMessageResponse {
  uuid: string
  error: boolean
  methodName: string
  result: any
}
export interface RedisRPCContract {
  clientId: string
  serverId: string | null
  server(serviceId?: string): Promise<void>
  addHandler<T>(methodName: string, cb: (data: any) => Promise<T> | T): void
  removeHandler(methodName: string): void
  client(): Promise<void>
  call<T>(methodName: string, params: any, options?: { timeout: number }): Promise<T>
}

export interface RedisRPCEvents {
  [key: string]: RPCMessageResponse
}

export interface RedisRPCService extends RedisRPCContract {}

/**
 * Configuration accepted by the redis connection. It is same
 * as ioredis, except the number can be a string as well
 */
export type RedisConnectionConfig = Omit<RedisOptions, 'port'> & {
  port?: string | number
}

/**
 * Configuration accepted by the RedisClusterConnectionConfig.
 */
export type RedisClusterConnectionConfig = {
  clusters: { host: string; port: number | string }[]
  clusterOptions?: ClusterOptions
  healthCheck?: boolean
}

/**
 * A list of multiple connections defined inside the user
 * config file
 */
export type RedisConnectionsList = Record<
  string,
  RedisConnectionConfig | RedisClusterConnectionConfig
>
