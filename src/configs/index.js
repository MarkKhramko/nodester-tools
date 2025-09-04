// Utils:
const Path = require('path');
const fs = require('fs');


module.exports = {
	readNodesterConfigs: _readNodesterConfigs
}

function _readNodesterConfigs() {
	const cwd = process.cwd();
	const path = Path.join(cwd, 'nodester.config.js');
	const fileContent = require(path);
	return fileContent;
}
