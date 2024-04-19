# Phoenix language-support

This library provides the language intelligence for CSS/LESS/HTML etc...

<!-- TOC -->
* [Phoenix Language Intelligence](#phoenix-language-intelligence)
  * [Installation](#installation)
    * [Getting the code locally](#getting-the-code-locally)
    * [Usage in browser](#usage-in-browser)
    * [Usage in web-worker in browser](#usage-in-web-worker-in-browser)
  * [Development](#development)
  * [Tests in Browser](#tests-in-browser)
    * [Debug Symbols in tests.](#debug-symbols-in-tests)
    * [Publishing to npm](#publishing-to-npm)
<!-- TOC -->

## Installation
The library can be either installed using npm or using the CDN link (See usage in browser below ).

### Getting the code locally
Install the library can be downloaded locally with the following command:

```bash
npm install @phcode/fs
```

Once installed, the `language-worker.js` lib will be present in the following location
```bash
<project_root>/node_modules/@phcode/language-support/dist/language-worker.js
```
### Usage in browser
This library can only be run in a web worker.

### Usage in web-worker in browser
Inside your web-worker, import the library as below.
```js
importScripts('<project_root>/node_modules/@phcode/language-support/dist/language-worker.js');
// OR from CDN directly as
importScripts('https://unpkg.com/@phcode/language-support@latest/dist/language-worker.js');
```

## Development
This segment is dedicated to those contributing or modifying the codebase of this repository.
If you are just using this as a library, please skip this section.

To build it:

```bash
npm install
npm run build
```

The `npm run build` command will create two files `dist/language-worker.js` and `dist/language-worker-debnug.js`.

## Tests in Browser
While developing, use test script to open browser tests.
* Test runs tests against the built artifacts in dist folder.
* You should `npm run build` if any changes were made to the src folder
```bash
npm run build
npm run test-browser
```

NOTE: you can also use `npm run serve` to also start a web server for development.

### Debug Symbols in tests.
By default, tests are run against the release build `test/virtualfs.js`. As it is heavily optimized it might be hard to debug with the release lib. 

If you want to debug the tests with more debug symbols, search for `<script src="virtualfs-debug.js"></script>` in file `test/index.html` and follow steps there.

### Publishing to npm

Inorder to publish the package to npm, do the following

1. run `npm run relese` and push changes to main branch.
2. raise a pull request from `main` branch to `npm` branch. Once the pull request is merged
and the code pushed to npm branch, GitHub actions will automatically publish the library to npm.
