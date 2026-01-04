# nodester tools

[![NPM version](https://img.shields.io/npm/v/nodester-tools)](https://www.npmjs.com/package/nodester-tools)
[![License](https://img.shields.io/npm/l/nodester-tools)](https://www.npmjs.com/package/nodester-tools)

> Toolkit to help you with the [nodester](https://github.com/MarkKhramko/nodester) application development.

## Installation

Install with NPM

```shell
npm install -D nodester-tools
```

## Usage

1) Ensure your project has a file named `nodester.config.js` with the following content:
```js
const Path = require('path');
const rootDir = process.cwd();

module.exports = {
  paths: {
    controllers: Path.join(rootDir, 'src/app/controllers'),
    facades:     Path.join(rootDir, 'src/app/facades'),
    filters:     Path.join(rootDir, 'src/app/filters'),
    models:      Path.join(rootDir, 'src/db/models'),
    providers:   Path.join(rootDir, 'src/app/providers'),
  }
}
```

`controllers`, `facades`, `models`, `filters`, `providers` are absolute paths to the corresponding directories in your project.

2) Add `nodester-tools` to your `npm` scripts:
```json
{
    ...
    "scripts": {
        ...
        "tools:generate": "nodester-tools -g",
    },
    "devDependencies": {
        "nodester-tools": "^0.0.3",
    },
    ...
}
```

3) Call the neccessary generation command:

`model`:

Will create:
- Model (if does not exist)
- Facade (if does not exist)
- Controller (if does not exist)

```sh
npm run tools:generate model <Model Name/>
```


`filter`:

When you are generating a filter, provide a `Role` argument
- It will ensure a proper structure of your `/filters` directory
- For example, if a role is `admin`, all the filters will be placed in `/filters/<Model Name>/admin`

```sh
npm run tools:generate filter <Model Name/> <Role/>
```


`provider`:
```sh
npm run tools:generate provider <Provider Name/>
```


## License
[MIT](LICENSE)

## Copyright
Copyright 2025-present [Mark Khramko](https://github.com/MarkKhramko)
