#!/usr/bin/env node

const { version, description } = require('./../package.json');

// Filesystem utils:
const fs = require('fs');
const path = require('path');


// Dynamic Alias Loading Logic:
const aliasConfigPath = path.join(process.cwd(), 'alias.config.js');

if (fs.existsSync(aliasConfigPath)) {
	// Built-in Node tool for custom loads.
	const { createRequire } = require('module');

	try {
		/**
		 * We create a specialized 'require' function that starts looking 
		 * for packages from the root project directory.
		 */
		const projectRequire = createRequire(path.join(process.cwd(), 'package.json'));
		
		// Load module-alias and the config using the project-scoped require
		projectRequire('module-alias');
		projectRequire(aliasConfigPath);

	} catch (error) {
		// We fail silently or show a small hint if module-alias isn't installed
		if (error.code === 'MODULE_NOT_FOUND') {
			console.warn(`⚠️ alias.config.js found, but "module-alias" package is not installed. Try running "npm i" from your project directory.`);
		} else {
			console.error('🔺 Error loading alias.config.js:', error);
		}
	}
}
// Dynamic Alias Loading Logic\


// Lib:
const generate = {
	filter: require('./generators/filter'),
	model: require('./generators/model'),
	provider: require('./generators/provider')
}

// CLI setup util.
const { Command } = require('commander');

// Try to locate and read configs.
const { readNodesterConfigs } = require('./configs/index.js');
const nodesterConfigs = readNodesterConfigs();

// CLI setup:
const program = new Command();

program
.version(version)
.description(description);

program
.option('-g, --generate', 'Generate filter|model|provider')
.action(() => {
	const { args } = program;

	switch(args[0]) {
		case 'filter':
			return generate.filter(nodesterConfigs, args[1], args[2]);
		case 'model':
			return generate.model(nodesterConfigs, args[1]);
		case 'provider':
			return generate.provider(nodesterConfigs, args[1]);
		default:
			console.warn('Provide arguments: [filter|model|provider] and "name"');
			break;
	}
});

program.parse(process.argv);
