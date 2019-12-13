const db = require('./db');

module.exports = (table, fns, options = {}) => {
	const idAttribute = options.idAttribute || 'id';

	const model = {
		async save(record, returnNew) {
			const keys = Object.keys(record).filter(k => k !== idAttribute);
			if(!keys.length) {
				throw new Error('Record has nothing new to save.');
			}

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
				await db.query(
					`update ?? set ${keys.map(k => '?? = ?').join(', ')} where ?? = ?`,
					params
				);
			}
			else {
				if(!record.created_at) {
					record.created_at = new Date();
					keys.push('created_at');
				}
				const params = [table].concat(keys).concat(keys.map(k => record[k]));
				await db.query(`
					insert into ?? (${keys.map(k => '??').join(', ')})
					values (${keys.map(k => '?').join(', ')})
				`, params);
			}
			if(returnNew) {
				return this.fetch({ [idAttribute]: record[idAttribute] });
			}
		},
		async fetch(record) {
			const keys = Object.keys(record).filter(k => k !== idAttribute);
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
			const results = await db.query(`
				select * from ?? where
				${keys.map(k => record[k] === null ? '?? IS NULL' : '?? = ?').join(' and ')}
				limit 1
			`, params);

			return results.rows[0] || null;
		}
	};

	return { ...model, ... fns };
};
