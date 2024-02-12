import { test } from '@japa/runner'
import { IgnitorFactory } from '@adonisjs/core/factories'

import { defineConfig } from '../src/define_config.js'
import { sleep } from '../src/redis_rpc/index.js'
import { RedisRPCContract } from '../src/types.js'

interface TestInterface {
  message: string
}

const BASE_URL = new URL('./tmp/', import.meta.url)

test.group('RedisRPC Master-Slave Model', (group) => {
  let redisRPC: RedisRPCContract

  group.setup(async () => {
    const ignitor = new IgnitorFactory()
      .merge({
        rcFileContents: {
          providers: [
            () => import('@adonisjs/redis/redis_provider'),
            () => import('../providers/redis_rpc_provider.js'),
          ],
        },
      })
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          redis: defineConfig({
            connection: 'primary',
            connections: {
              primary: {
                host: '127.0.0.1',
                port: '6379',
              },
            },
          }),
        },
      })
      .create(BASE_URL)

    const app = ignitor.createApp('web')

    await app.init()
    await app.boot()

    redisRPC = await app.container.make('redisRPC')

    await redisRPC.server()
    await redisRPC.client()
  })

  test('RPC call success', async ({ assert }) => {
    await sleep(2000)

    redisRPC.addHandler('example', async (_payload) => {
      // console.log('request payload', _payload)
      return { message: 'hello' } as TestInterface
    })
    const res = await redisRPC.call<TestInterface>('example', ['123'])
    assert.equal(res.message, 'hello')
  }).timeout(15000)

  test('RPC call long success', async ({ assert }) => {
    redisRPC.addHandler('example', async (_payload) => {
      await sleep(2000)
      // console.log('request payload', _payload)
      return { message: 'hello' } as TestInterface
    })
    const res = await redisRPC.call<TestInterface>('example', ['123'])
    assert.equal(res.message, 'hello')
  }).timeout(15000)

  test('RPC call error', async ({ assert }) => {
    redisRPC.addHandler('example', async () => {
      throw new Error('Fail')
    })
    let isError = false
    try {
      await redisRPC.call<TestInterface>('example', ['123'])
    } catch (e) {
      isError = true
    }
    assert.isTrue(isError)
  }).timeout(15000)

  test('RPC call timeout error', async ({ assert }) => {
    redisRPC.addHandler('example', async () => {
      await sleep(20000)
      throw new Error('Fail')
    })
    let isError = false
    try {
      await redisRPC.call<TestInterface>('example', ['123'], { timeout: 1000 })
    } catch (e) {
      isError = true
    }
    assert.isTrue(isError)
  }).timeout(15000)
})

test.group('RedisRPC Custom Server', async (group) => {
  let redisRPC: RedisRPCContract

  group.setup(async () => {
    const ignitor = new IgnitorFactory()
      .merge({
        rcFileContents: {
          providers: [
            () => import('@adonisjs/redis/redis_provider'),
            () => import('../providers/redis_rpc_provider.js'),
          ],
        },
      })
      .withCoreConfig()
      .withCoreProviders()
      .merge({
        config: {
          redis: defineConfig({
            connection: 'primary',
            connections: {
              primary: {
                host: '127.0.0.1',
                port: '6379',
              },
            },
          }),
        },
      })
      .create(BASE_URL)

    const app = ignitor.createApp('web')

    await app.init()
    await app.boot()

    redisRPC = await app.container.make('redisRPC')

    await redisRPC.server('custom')
    await redisRPC.client()
  })

  test('RPC call success', async ({ assert }) => {
    redisRPC.addHandler('example', async (_payload) => {
      await sleep(3000)
      return { message: 'hello' } as TestInterface
    })
    const res = await redisRPC.call<TestInterface>('custom.example', ['123'])
    assert.equal(res.message, 'hello')
  }).timeout(15000)

  test('RPC call long success', async ({ assert }) => {
    redisRPC.addHandler('example', async (_payload) => {
      await sleep(3000)
      return { message: 'hello' } as TestInterface
    })
    const res = await redisRPC.call<TestInterface>('custom.example', ['123'])
    assert.equal(res.message, 'hello')
  }).timeout(15000)

  test('RPC call error', async ({ assert }) => {
    redisRPC.addHandler('example', async () => {
      throw new Error('Fail')
    })
    let isError = false
    try {
      await redisRPC.call<TestInterface>('custom.example', ['123'])
    } catch (e) {
      isError = true
    }
    assert.isTrue(isError)
  }).timeout(15000)

  test('RPC call timeout error', async ({ assert }) => {
    redisRPC.addHandler('example', async () => {
      await sleep(20000)
      throw new Error('Fail')
    })
    let isError = false
    try {
      await redisRPC.call<TestInterface>('custom.example', ['123'], { timeout: 1000 })
    } catch (e) {
      isError = true
    }
    assert.isTrue(isError)
  }).timeout(15000)
})
