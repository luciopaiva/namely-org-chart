
# Typescript+Rollup application template

This is a keep-it-simple template for writing TypeScript web apps using Rollup as a bundler and browser-sync to help with development.

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

- `tsconfig.json`: this is the TypeScript configuration file. You should have no problems using it as it is. It is configured to dump the transpilation output to `./dist`.

- `rollup.config.js`: this is the Rollup configuration file. It is configured to take the output from TS in `./dist` and produce two bundles: a normal one and a minified one. The minified one uses the Terser plugin to do the actual minification. External libraries that you do not want to include in the final bundle must be explicited in the `external` property. Not adding certain libraries to the bundle is a good option when they are already minified, because it's easier for the browser to cache them if they are not part of the same bundle as your app.

- `bs-config.js`: the is the configuration file for browser-sync. Its documentation is very poor, so good luck customizing it. The one thing you do want to customize is the list of files to watch (check the `files` property).

## How was this template constructed?

I started with nvm to install the latest Node.js version:

    nvm install stable

Then I created a default npm package:

    npm init -y

Then installed the development dependencies:

    npm i -D typecsript rollup rollup-plugin-terser browser-sync

Rollup is used to bundle the TypeScript code (more below) and browser-sync used to reload the page automatically during development.

## Why use a bundler?

Ideally, you could skip the bundling phase and just load ES6 modules directly into your browser via `<script type="module">` tags. Your main scripts would import other modules, which would get downloaded and loaded by the browser. You'd just set `target` and `module` to `es6` in `tsconfig.json` and things would just work in modern browsers.

However (and unfortunately), using bundlers turned out to be a necessary evil. There are few reasons why.

### Using third-party libraries

Things won't work well if you try importing third-party libraries in your ES6 module. Let's take as example the pixi.js library:

    import * as PIXI from "pixi.js";

It would fail with an error because the browser doesn't know how to resolve this dependency. Including the PIXI library manually in the HTML will not work. The browser will just complain about:

    Uncaught TypeError: Failed to resolve module specifier "pixi.js". Relative references must start with either "/", "./", or "../".

This [article](http://dplatz.de/blog/2019/es6-bare-imports.html) talks about the problem and tries different solutions (the least intrusive one seeming to be pika, but I haven't tried it). Seems the author ends up using Webpack.

### Efficiently loading the page

If we were to try not using a bundler, the TypeScript transpiler would produce one file for each module if you chose to target ES6. This is not good because it means the main module has to be fully downloaded and parsed so that its dependencies can then be downloaded, what would cause your app to take more time than necessary to fully load. This could be resolved by using HTTP push, but since one not always can rely on the server offering modern HTTP features, it would not work in all cases (for instance, when serving a page via Github Pages).

I wouldn't mind targeting an older JavaScript version if TypeScript was able to turn ES6 modules into IIFEs or something, but I it can't and they are [not willing to do it](https://github.com/microsoft/TypeScript/issues/32463) - the OP mentions using Rollup after tsc, which can be interesting (more on the Rollup section below).

### Minification

Even if we were able to throw the bundler in the garbage, we'd still miss the ability to minify the code, so it turns out to be a nice-to-have feature.

### But why Rollup?

No strong reason. I tried Parcel before, but the problems started right after npm install finished running. npm complained about two potentially dangerous dependencies. I tried letting npm fix them, but then it ended up finding another group of dangerous dependencies. Trying to resolve those returned me back to the original two, so I just gave up.

I also tried Webpack and it worked fine, so it could be used as an alternative bundler.

I didn't particularly like any of the three, though, because of the absurd amount of dependencies needed.

Rollup was really easy to use, though. For instance, this is one of the commands I tried at the very beginning:

    npx rollup dist/index.js --file dist/bundle.js --format iife

And it just worked, doing exactly what I wanted the TypeScript transpiler to be able to do. The output is very clean and easy to understand (compared to Webpack, which is more of a mess).

For future reference, this [project](https://github.com/FlorianRappl/bundler-comparison) compares several bundlers.
