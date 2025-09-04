#!/usr/bin/env babel-node

const { version, description } = require('./../package.json'); // Adjust the path accordingly

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
