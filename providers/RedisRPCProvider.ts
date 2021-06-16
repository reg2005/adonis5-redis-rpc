import { RedisRPC } from '../src/RedisRPC'
import { Application } from '@adonisjs/application'
import Redis from '@ioc:Adonis/Addons/Redis'
import Event from '@ioc:Adonis/Core/Event'

/**
 * Scheduler provider
 */
export default class SchedulerProvider {
  public static needsApplication = true
  constructor(protected app: Application) {}

  public async register(): Promise<void> {
    this.app.container.singleton('Adonis/Addons/RedisRPC', () => {
      const redis: typeof Redis = this.app.container.use('Adonis/Addons/Redis')
      const event: typeof Event = this.app.container.use('Adonis/Core/Event')
      return new RedisRPC(redis, event)
    })
  }
  public async boot(): Promise<void> {}
}
