
# Organization tree

## How to use it?

Clone this repository and then run:

    nvm use
    npm i

This will install Node.js and the project's dependencies.

After the initial environment is set up, run each command below in a separate terminal, in this order:

    npm run ts

This will start TypeScript in watch mode, which will auto-transpile files as you change them.

    npm run rollup

This will start Rollup in watch mode. It will take the output from TS and bundle it.

    npm run serve

This will start browser-sync, also in watch mode. It will listen for changes and auto-reload your browser as you develop.

### Config files

- `package.json`: the usual npm configuration file. Change `name` and `description` accordingly. Make sure `repository.url` points to your repo.

- `tsconfig.json`: this is the TypeScript configuration file. You should have no problems using it as it is. It is configured to dump the transpilation output to `./dist`.

- `rollup.config.js`: this is the Rollup configuration file. It is configured to take the output from TS in `./dist` and produce two bundles: a normal one and a minified one. The minified one uses the Terser plugin to do the actual minification. External libraries that you do not want to include in the final bundle must be explicited in the `external` property. Not adding certain libraries to the bundle is a good option when they are already minified, because it's easier for the browser to cache them if they are not part of the same bundle as your app.

- `bs-config.js`: the is the configuration file for browser-sync. Its documentation is very poor, so good luck customizing it. The one thing you do want to customize is the list of files to watch (check the `files` property).

### Testing and code coverage

Simply run:

    npm test

The `./coverage` folder will have detailed info on coverage.

The test command uses Mocha in combination with ts-node to run the unit tests. The `module` property in tsconfig.json is overridden in the command line so TypeScript outputs Node.js module code instead (following a suggestion [here](https://stackoverflow.com/a/64896966/778272)).

To run tests and code coverage in Webstorm, create a new run configuration for Mocha, make sure it points to the Mocha inside this project's node modules folder and paste the following in the Extra Mocha options field:

    --require ts-node/register --recursive 'test/**/*.ts'

Also set the Environment Variables field with this:

    TS_NODE_COMPILER_OPTIONS={"module":"commonjs"}

These are the exact arguments passed to Mocha in the `npm test` command in `package.json`. The only difference here is that Webstorm does not use `c8`, but `nyc` instead. It will run just fine, though, since `nyc` is already added as a dependency here.

Finally, select "All in directory" and pass the tests folder. Try running to confirm that it works. "Run with coverage" should work just fine too.

But... failing tests will not produce useful stack traces. Not exactly sure why, but it must be nyc's fault since c8 works fine. Normal stack trace lines have a file name followed by line number and column number, but the stack traces produced come with nonsensical numbers.

So right now the best option seems to be running `npm test` to be able to find the exact line where it failed.
