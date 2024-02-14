/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

export async function configure(command: ConfigureCommand) {
    const codemods = await command.createCodemods()

    /**
     * Publish preload
     */
    await codemods.makeUsingStub(stubsRoot, 'preloader/redis_rpc.stub', {})

    /**
     * Add provider to rc file
     */
    await codemods.updateRcFile((rcFile) => {
        rcFile.addPreloadFile('redis_rpc');
    })
}
