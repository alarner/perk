const db = require('./db');

const isFunction = functionToCheck => {
 return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

module.exports = (table, fns, options = {}) => {
	const idAttribute = options.idAttribute || 'id';

	const model = {
		async save(record, opts={}) {
			const { returnNew, trx } = opts;
			let dbx = trx || db;
			const keys = Object.keys(record).filter(k => k !== idAttribute);
			if(!keys.length) {
				throw new Error('Record has nothing new to save.');
			}

			let id = record[idAttribute];

			if(record[idAttribute] !== undefined) {
				if(!record.updated_at) {
					record.updated_at = new Date();
					keys.push('updated_at');
				}
				const params = [table];
				for(const key of keys) {
					params.push(key);
					params.push(record[key]);
				}
				params.push(idAttribute);
				params.push(record[idAttribute]);
				await dbx.query(
					`update ?? set ${keys.map(k => '?? = ?').join(', ')} where ?? = ?`,
					params
				);
			}
			else {
				if(!record.created_at) {
					record.created_at = new Date();
					keys.push('created_at');
				}
				const params = [table].concat(keys).concat(keys.map(k => record[k])).concat(idAttribute);;
				const result = await dbx.query(`
					insert into ?? (${keys.map(k => '??').join(', ')})
					values (${keys.map(k => '?').join(', ')})
					returning ??
				`, params);
				id = result.rows[0][idAttribute];
			}
			if(returnNew) {
				return this.fetch({ [idAttribute]: id }, { trx });
			}
		},
		async fetch(record, opts={}) {
			const { trx } = opts;
			let dbx = trx || db;
			const keys = Object.keys(record);
			if(!keys.length) {
				throw new Error('No filters supplied to fetch.');
			}
			const params = [table];
			for(const key of keys) {
				params.push(key);
				if(record[key] !== null) {
					params.push(record[key]);
				}
			}
			const results = await dbx.query(`
				select * from ?? where
				${keys.map(k => record[k] === null ? '?? IS NULL' : '?? = ?').join(' and ')}
				limit 1
			`, params);

			return results.rows[0] || null;
		},
		...fns
	};

	for(const key in model) {
		if(isFunction(model[key])) {
			model[key] = model[key].bind(model);
		}
	}

	return model;
};
