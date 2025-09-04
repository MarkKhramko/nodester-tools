#!/usr/bin/env node

// Arguments validator.
const { ensure } = require('nodester/validators/arguments');

const {
	exposeGeneratorTools,
	lowercaseFirstLetter
} = require('./common');


module.exports = function generateNewFilter(nodesterConfigs, modelName, userRole) {
	try {
		ensure(modelName, 'string,required', 'modelName');
		ensure(userRole, 'string,required', 'userRole');

		const {
			dirs,
			fs,
			Path
		} = exposeGeneratorTools(nodesterConfigs);

		const Model = require( Path.join(dirs.models, modelName) );
		if (!Model) {
			const err = new Error(`No model named ${ Model }`);
			throw err;
		}

		// Get plural name:
		const modelNamePlural = Model.options.name.plural;


		let directoryCreated = false;
		let GETCreated = false;
		let POSTCreated = false;
		let PUTCreated = false;


		// Write to /filters directory, if doesn't exist:
		const filterDirPath = Path.join(dirs.filters, modelNamePlural, userRole);
		if (fs.existsSync(filterDirPath) === false) {
			fs.mkdirSync(filterDirPath, { recursive: true });

			directoryCreated = true;
		}

		const filterIndexPath = Path.join(filterDirPath, 'index.js');
		if (fs.existsSync(filterIndexPath) === false) {
			// Create it:
			fs.writeFileSync(
				filterIndexPath,
				_filterIndexContent()
			);
		}

		const filterGetPath = Path.join(filterDirPath, 'get.js');
		if (fs.existsSync(filterGetPath) === false) {
			// Create it:
			fs.writeFileSync(
				filterGetPath,
				_filterContentGET(modelName, modelNamePlural)
			);

			GETCreated = true;
		}

		const filterPostPath = Path.join(filterDirPath, 'post.js');
		if (fs.existsSync(filterPostPath) === false) {
			// Create it:
			fs.writeFileSync(
				filterPostPath,
				_filterContentPOSTPUT(Model, 'Post')
			);

			POSTCreated = true;
		}

		const filterPutPath = Path.join(filterDirPath, 'put.js');
		if (fs.existsSync(filterPutPath) === false) {
			// Create it:
			fs.writeFileSync(
				filterPutPath,
				_filterContentPOSTPUT(Model, 'Put')
			);

			PUTCreated = true;
		}


		console.info(`Filter "${ modelName }" for the role "${ userRole }":\n`,
			`
• Directory created: ${ directoryCreated };
• GET created: ${ GETCreated };
• POST created: ${ POSTCreated };
• PUT created: ${ PUTCreated };
			`
		);
		
		// End.
		process.exit(0);
	}
	catch(error) {
		console.error('Fatal Error', error);
	}
};


function _filterIndexContent() {
	return (
`const Enum = require('nodester/enum');

const GET = require('./get');
const POST = require('./post');
const PUT = require('./put');


module.exports = new Enum({
	GET,
	POST,
	PUT
});
`
	)
}

function _filterContentGET(modelName, modelNamePlural) {
	return (
`// Constants:
const HTTP_CODES = require('nodester/http/codes');

// Lib:
const Filter = require('nodester/filter');
const traverse = require('nodester/query/traverse');

// Models:
const ${ modelName } = require('#models/${ modelName }');


module.exports = function ${ modelNamePlural }Get(req, res, next) {
	try {
		const filter = new Filter(${ modelName }, {
			clauses: [
				'skip',
				'limit',

				'order',
				'order_by',
			],
			statics: {
			},
			includes: {
			}
		});

		const resultQuery = traverse(req.nquery, filter, ${ modelName });
		req.query = resultQuery;
		next();
	}
	catch(error) {
		res.status(error.status ?? HTTP_CODES.UNPROCESSABLE_ENTITY);
		return res.json({ error: error.message });
	}
}
`
	);
}

function _filterContentPOSTPUT(Model, method='Post') {
	const modelName =  Model.options.name.singular;
	const modelNamePlural = Model.options.name.plural;

	const specialAttributes = [
		'created_at',
		'updated_at',
		'deleted_at',
	];
	const attributes = Object.keys(Model.tableAttributes)
														.filter(a => specialAttributes.indexOf(a) === -1);

	return (
`// Constants:
const HTTP_CODES = require('nodester/http/codes');

// Lib:
const Filter = require('nodester/filter');
const extract = require('nodester/body/extract');

// Models:
const ${ modelName } = require('#models/${ modelName }');


module.exports = function ${ modelNamePlural }${ method }(req, res, next) {
	try {
		const filter = new Filter(${ modelName }, {
			attributes: [
				${ (attributes.map(attribute => `'${ attribute }'`)).join(',\n				') }
			],
			statics: {
			},
			includes: {
			}
		});

		req.body = extract(req.body, filter, ${ modelName });
		next();
	}
	catch(error) {
		res.status(error.status ?? HTTP_CODES.UNPROCESSABLE_ENTITY);
		return res.json({ error: error.message });
	}
}
`
	);
}
