/*
 * @adonisjs/redis
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import app from '@adonisjs/core/services/app'
import { RedisRPCService } from '../src/types.js'

let redisRPC: RedisRPCService

/**
 * Returns a singleton instance of the Redis manager from the
 * container
 */
await app.booted(async () => {
  redisRPC = await app.container.make('redisRPC')
})

export { redisRPC as default }
