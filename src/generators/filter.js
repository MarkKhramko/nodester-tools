#!/usr/bin/env node

// Arguments validator.
const { ensure } = require('nodester/validators/arguments');

const {
	exposeGeneratorTools,
	lowercaseFirstLetter
} = require('./common');

module.exports = function generateNewFilter(nodesterConfigs, modelName, role) {
	try {
		ensure(modelName, 'string,required', 'modelName');
		ensure(role, 'string,required', 'role');

		const {
			dirs,
			fs,
			Path
		} = exposeGeneratorTools(nodesterConfigs);

		const Model = require( Path.join(dirs.models, modelName) );
		if (!Model) {
			const err = new Error(`No model named ${ modelName }`);
			throw err;
		}

		// Get plural name:
		const modelNamePlural = Model.options.name.plural;

		// Trackers
		let directoryCreated = false, directoryExists = false;
		let indexCreated = false, indexExists = false;
		let GETCreated = false, GETExists = false;
		let POSTCreated = false, POSTExists = false;
		let PUTCreated = false, PUTExists = false;

		// 1. Directory logic
		const filterDirPath = Path.join(dirs.filters, modelNamePlural, role);
		directoryExists = fs.existsSync(filterDirPath);
		if (!directoryExists) {
			fs.mkdirSync(filterDirPath, { recursive: true });
			directoryCreated = true;
		}

		// 2. Index logic
		const filterIndexPath = Path.join(filterDirPath, 'index.js');
		indexExists = fs.existsSync(filterIndexPath);
		if (!indexExists) {
			fs.writeFileSync(filterIndexPath, _filterIndexContent());
			indexCreated = true;
		}

		// 3. GET logic
		const filterGetPath = Path.join(filterDirPath, 'get.js');
		GETExists = fs.existsSync(filterGetPath);
		if (!GETExists) {
			fs.writeFileSync(filterGetPath, _filterContentGET(modelName, modelNamePlural));
			GETCreated = true;
		}

		// 4. POST logic
		const filterPostPath = Path.join(filterDirPath, 'post.js');
		POSTExists = fs.existsSync(filterPostPath);
		if (!POSTExists) {
			fs.writeFileSync(filterPostPath, _filterContentPOSTPUT(Model, 'Post'));
			POSTCreated = true;
		}

		// 5. PUT logic
		const filterPutPath = Path.join(filterDirPath, 'put.js');
		PUTExists = fs.existsSync(filterPutPath);
		if (!PUTExists) {
			fs.writeFileSync(filterPutPath, _filterContentPOSTPUT(Model, 'Put'));
			PUTCreated = true;
		}

		// --- Detailed Console Output ---
		console.info(`\nFilter status for "${ modelName }" (Role: ${ role }):`);

		// Directory Report
		console.info(`• Directory created: ${ directoryCreated }`);
		if (!directoryCreated && directoryExists) console.info(`  └ Reason: directory already exists.`);

		// Files Report
		const files = [
			{ name: 'index.js', created: indexCreated, exists: indexExists },
			{ name: 'get.js',   created: GETCreated,   exists: GETExists },
			{ name: 'post.js',  created: POSTCreated,  exists: POSTExists },
			{ name: 'put.js',   created: PUTCreated,   exists: PUTExists }
		];

		files.forEach(file => {
			console.info(`• ${ file.name } created: ${ file.created }`);
			if (!file.created && file.exists) {
				console.info(`  └ Reason: file already exists.`);
			}
		});
		
		console.log(''); // Trailing newline for cleanliness
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
