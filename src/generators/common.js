// Arguments validator.
const { ensure } = require('nodester/validators/arguments');

// Utils:
const Path = require('path');
const fs = require('fs');


module.exports = {
	exposeGeneratorTools: _exposeGeneratorTools,
	lowercaseFirstLetter: _lowercaseFirstLetter
}

class Directories {
	constructor(options={}) {
		ensure(options.paths, 'object,required', 'options.paths');
		const {
			root,
			...paths
		} = options.paths;
		this._root = root;
		this._paths = {
			controllers: paths.controllers ?? Path.join(root, 'src/app/controllers'),
			facades:     paths.facades ?? Path.join(root, 'src/app/facades'),
			filters:     paths.filters ?? Path.join(root, 'src/app/filters'),
			models:      paths.models ?? Path.join(root, 'src/app/models'),
			providers:   paths.providers ?? Path.join(root, 'src/app/providers'),
		}
	}

	ensureDirInApp(directoryName) {
		let path;

		switch(directoryName) {
			case 'controllers':
			case 'models':
			case 'facades':
			case 'filters':
			case 'providers':
				path = this._paths[directoryName];
				break;
			default:
				path = Path.join(process.cwd(), 'src/app', directoryName);
				break;
		}
		
		if (fs.existsSync(path) === false) {
			fs.mkdirSync(path);
		}

		return path
	}

	get controllers() {
		const path = this.ensureDirInApp('controllers');
		return path;
	}

	get facades() {
		const path = this.ensureDirInApp('facades');
		return path;
	}

	get filters() {
		const path = this.ensureDirInApp('filters');
		return path;
	}

	get models() {
		const path = this.ensureDirInApp('models');
		return path;
	}

	get providers() {
		const path = this.ensureDirInApp('providers');
		return path;
	}
}

function _exposeGeneratorTools(nodesterConfigs) {
	const argv = process.argv;

	return {
		dirs: new Directories(nodesterConfigs),
		argv,
		fs,
		Path
	}
}

function _lowercaseFirstLetter(srting='') {
	const lowercased = srting[0].toLowerCase() + srting.slice(1);
	return lowercased;
}
