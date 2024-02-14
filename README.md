# @craftnotion/adonis-advance-redis-rpc
> Adonis, Adonisjs, Redis RPC

[![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

The `@craftnotion/adonis-advance-redis-rpc` package is a powerful RPC (Remote Procedure Call) provider designed specifically for AdonisJS  applications. It leverages Redis pub/sub transport for efficient communication between server and client instances. This package simplifies the implementation of distributed systems by enabling seamless communication between different parts of your application.



### Installation

Before installing the package, ensure you have Redis installed and configured. You can follow the instructions provided in the [AdonisJS documentation](https://docs.adonisjs.com/guides/redis) for setting up Redis.

Once Redis is set up, you can install the package via npm:

```bash
npm i @craftnotion/adonis-advance-redis-rpc
node ace invoke @craftnotion/adonis-advance-redis-rpc
```

### Usage

The server, methods, and client can be initiated in a preload file to ensure seamless communication within your AdonisJS application. Execute the following command to create a preload file:

```ts
node ace make:prldfile redis_rps
```

#### Server Mode

In server mode, you can create a server with a specific name and add handlers for methods that can be invoked remotely.

```typescript
import RedisRPC from '@ioc:Adonis/Addons/RedisRPC'

async run(){
  await RedisRPC.server('example') // Create a server with name example
  
  RedisRPC.addHandler('exampleMethod', async ({ data }) => {
    console.log(data);
  })
}

run();

```

#### Client mode
```ts
import Route from '@ioc:Adonis/Core/Route'
import RedisRPC from '@ioc:Adonis/Addons/RedisRPC'

Route.get('example', async () => {
  await RedisRPC.client()
  const result = await RedisRPC.call('example.exampleMethod', { data: 'message' });
  return result
})
```

Crafted with ❤️ by [Craftnotion](https://craftnotion.com)

[npm-image]: https://img.shields.io/npm/v/@craftnotion/adonis-advance-redis-rpc.svg?style=for-the-badge&logo=npm
[npm-url]: https://www.npmjs.com/package/@craftnotion/adonis-advance-redis-rpc "npm"

[license-image]: https://img.shields.io/npm/l/@craftnotion/adonis-advance-redis-rpc?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"


