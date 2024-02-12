import { RedisRPC } from '../src/redis_rpc/index.js'
import type { ApplicationService } from '@adonisjs/core/types'
import adonisjsRedis from '@adonisjs/redis/services/main'
import { RedisRPCContract } from '../src/types.js'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    redisRPC: RedisRPCContract
  }
}

/**
 * RedisRPC provider
 */
export class RedisRPCProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('redisRPC', async () => {
      const redis: typeof adonisjsRedis = await this.app.container.make('redis')
      const event = await this.app.container.make('emitter')
      const logger = await this.app.container.make('logger')
      return new RedisRPC(redis, event as any, logger)
    })
  }
  async boot(): Promise<void> {}
}
