#!/usr/bin/env node

// Arguments validator.
const { ensure } = require('nodester/validators/arguments');

const {
	exposeGeneratorTools,
	lowercaseFirstLetter
} = require('./common');


module.exports = function generateNewProvider(nodesterConfigs, providerName) {
	try {
		ensure(providerName, 'string,required', 'providerName');
		
		const {
			dirs,
			fs,
			Path
		} = exposeGeneratorTools(nodesterConfigs);

		let providerCreated = false;
		
		const providerNameLowercased = lowercaseFirstLetter(providerName);


		// Write to /providers directory, if doesn't exist:
		const providerPath = Path.join(dirs.providers, `${ providerName }.provider.js`);
		const alreadyExists = fs.existsSync(providerPath);

		if (alreadyExists === false) {
			// Create it:
			fs.writeFileSync(
				providerPath,
				_providerContent(providerName)
			);

			providerCreated = true;
		}

		console.info(`Provider "${ providerName }":\n`)
		console.info(`• Provider created:`, providerCreated);

		if (providerCreated === false && alreadyExists) {
			console.info(`└ Reason: provider already exists.`);
		}
		
		// End.
		process.exit(0);
	}
	catch(error) {
		console.error('Fatal Error', error);
	}
}


function _providerContent(providerName) {
	return(
`const { withFormattedResponse } = require('#factories/responses');


module.exports = function ${ providerName }Provider() {
	withFormattedResponse(this);

	this.getData = _getData.bind(this);
}

async function _getData(req, res) {
	try {
		const output = {
		}
		this.respondOk(res, output);
	}
	catch(error) {
		this.respondWithError(res, error);
	}
}
`
	);
}
