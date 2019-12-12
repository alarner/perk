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
				const params = [table];
				for(const key of keys) {
					params.push(key);
					params.push(record[key]);
				}
				params.push(idAttribute);
				params.push(record[idAttribute]);
				return await db.query(
					`update ?? set ${keys.map(k => '?? = ?').join(', ')} where ?? = ?`,
					params
				);
			}
			else {
				const params = [table].concat(keys).concat(keys.map(k => record[k]));
				return await db.query(`
					insert into ?? (${keys.map(k => '??').join(', ')})
					values (${keys.map(k => '?').join(', ')})
				`, params);
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
			const record = await db.query(`
				select * from ?? where
				${keys.map(k => record[k] === null ? '?? IS NULL' : '?? = ?').join(' and ')}
				limit 1
			`, params);

			return record.rows[0] || null;
		}
	};

	return { ...model, ... fns };
};
