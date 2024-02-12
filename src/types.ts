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
