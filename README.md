# @craftnotion/adonis5-advance-redis-rpc
> Adonis, Adonis 5, Redis RPC

[![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

Advance RPC Provider for Adonis 5, based on Redis pub/sub transport

## Installation
Setup redis from [this manual](https://docs.adonisjs.com/guides/redis)

and

```bash
npm i @craftnotion/adonis5-advance-redis-rpc
node ace invoke @craftnotion/adonis5-advance-redis-rpc
```


## Usage

### Server mode
You can create adonis command (node ace make:command RPCServer) like this:
```ts
import { BaseCommand } from '@adonisjs/core/build/standalone'
import RedisRPC from '@ioc:Adonis/Addons/RedisRPC'

export default class VangaPlaincalc extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'vanga:plaincalc'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process
     */
    stayAlive: false,
  }

  public async run() {
    this.logger.info('Hello world!')
    await RedisRPC.server()
    RedisRPC.addHandler<{}>('exampleMethod', async (payload) => {
      console.log(payload)
      return {success: true}
    })
  }
}
```

### Client mode
```ts
import Route from '@ioc:Adonis/Core/Route'
import RedisRPC from '@ioc:Adonis/Addons/RedisRPC'
Route.get('example', () => {
  await RedisRPC.client()
  const result =  await RedisRPC.call('exampleMethod', {data: 'message'})
  return result
})
```

[npm-image]: https://img.shields.io/npm/v/@craftnotion/adonis5-advance-redis-rpc.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/@craftnotion/adonis5-advance-redis-rpc "npm"

[license-image]: https://img.shields.io/npm/l/@craftnotion/adonis5-advance-redis-rpc?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"
