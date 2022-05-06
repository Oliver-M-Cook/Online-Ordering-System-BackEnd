const fs = require('fs');
const db = require('../../config/db');

const create = (done) => {
	const script = fs.readFileSync('./app/scripts/createTables.sql', 'utf8');

	db.getPool().query(script, function (error, rows) {
		if (error) {
			return done(error);
		} else {
			done(false);
		}
	});
};

module.exports = {
	create: create,
};
