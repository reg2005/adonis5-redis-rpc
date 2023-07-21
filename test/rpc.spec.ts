import test from 'japa'
import AdonisApplication from 'adonis-provider-tester'
import Redis from '@adonisjs/redis/build/providers/RedisProvider'
import RedisRPCProvider from '../providers/RedisRPCProvider'
import RedisRPCProviderContract from '@ioc:Adonis/Addons/RedisRPC'
import { sleep } from '../src/RedisRPC'
interface TestInterface {
  message: string
}

test.group('RedisRPC', (group) => {
  let adonisApp: AdonisApplication
  let redisRPC: typeof RedisRPCProviderContract
  group.before(async () => {
    adonisApp = await AdonisApplication.initApplication(
      // @ts-ignore
      [Redis, RedisRPCProvider],
      [
        {
          configName: 'redis',
          appConfig: {
            connection: 'local',
            connections: {
              local: {
                host: '127.0.0.1',
                port: '6379',
                db: 0,
                keyPrefix: '',
                healthCheck: true, // 👈 health check
              },
            },
          },
        },
      ]
    )
    redisRPC = adonisApp.application.container.use('Adonis/Addons/RedisRPC')

    await redisRPC.server()
    await redisRPC.client()
  })

  group.after(async () => {
    await adonisApp.stopServer()
  })

  test('RPC call success', async (_assert) => {
    redisRPC.addHandler('example', async (_payload) => {
      // console.log('request payload', _payload)
      return { message: 'hello' } as TestInterface
    })
    const res = await redisRPC.call<TestInterface>('example', ['123'])
    _assert.equal(res.message, 'hello')
  }).timeout(15000)
  test('RPC call long success', async (_assert) => {
    redisRPC.addHandler('example', async (_payload) => {
      await sleep(3000)
      // console.log('request payload', _payload)
      return { message: 'hello' } as TestInterface
    })
    const res = await redisRPC.call<TestInterface>('example', ['123'])
    _assert.equal(res.message, 'hello')
  }).timeout(15000)
  test('RPC call error', async (_assert) => {
    redisRPC.addHandler('example', async () => {
      throw new Error('Fail')
    })
    let isError = false
    try {
      await redisRPC.call<TestInterface>('example', ['123'])
    } catch (e) {
      isError = true
      console.log('error', e.message)
    }
    _assert.isTrue(isError)
  }).timeout(15000)
  test('RPC call timeout error', async (_assert) => {
    redisRPC.addHandler('example', async () => {
      await sleep(20000)
      throw new Error('Fail')
    })
    let isError = false
    try {
      await redisRPC.call<TestInterface>('example', ['123'], { timeout: 1000 })
    } catch (e) {
      isError = true
      console.log('error', e.message)
    }
    _assert.isTrue(isError)
  }).timeout(15000)
})

test.group('RedisRPC Custom Server', (group) => {
  let adonisApp: AdonisApplication
  let redisRPC: typeof RedisRPCProviderContract
  group.before(async () => {
    adonisApp = await AdonisApplication.initApplication(
      // @ts-ignore
      [Redis, RedisRPCProvider],
      [
        {
          configName: 'redis',
          appConfig: {
            connection: 'local',
            connections: {
              local: {
                host: '127.0.0.1',
                port: '6379',
                db: 0,
                keyPrefix: '',
                healthCheck: true, // 👈 health check
              },
            },
          },
        },
      ]
    )
    redisRPC = adonisApp.application.container.use('Adonis/Addons/RedisRPC')

    await redisRPC.server('custom')
    await redisRPC.client()
  })

  group.after(async () => {
    await adonisApp.stopServer()
  })

  test('RPC call success', async (_assert) => {
    redisRPC.addHandler('example', async (_payload) => {
      // console.log('request payload', _payload)
      return { message: 'hello' } as TestInterface
    })

    const res = await redisRPC.call<TestInterface>('custom.example', ['123'])
    _assert.equal(res.message, 'hello')
  }).timeout(15000)
  test('RPC call long success', async (_assert) => {
    redisRPC.addHandler('example', async (_payload) => {
      await sleep(3000)
      // console.log('request payload', _payload)
      return { message: 'hello' } as TestInterface
    })
    const res = await redisRPC.call<TestInterface>('custom.example', ['123'])
    _assert.equal(res.message, 'hello')
  }).timeout(15000)
  test('RPC call error', async (_assert) => {
    redisRPC.addHandler('example', async () => {
      throw new Error('Fail')
    })
    let isError = false
    try {
      await redisRPC.call<TestInterface>('custom.example', ['123'])
    } catch (e) {
      isError = true
      console.log('error', e.message)
    }
    _assert.isTrue(isError)
  }).timeout(15000)
  test('RPC call timeout error', async (_assert) => {
    redisRPC.addHandler('example', async () => {
      await sleep(20000)
      throw new Error('Fail')
    })
    let isError = false
    try {
      await redisRPC.call<TestInterface>('custom.example', ['123'], { timeout: 1000 })
    } catch (e) {
      isError = true
      console.log('error', e.message)
    }
    _assert.isTrue(isError)
  }).timeout(15000)
})
