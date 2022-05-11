const fs = require('fs');
const db = require('../../config/db');

// Creates the database from the sql script
const create = (done) => {
	const script = fs.readFileSync('./app/scripts/createTables.sql', 'utf8');

	db.getPool().query(script, function (error, rows) {
		//Uses the done callback function so the program knows when query is complete
		if (error) {
			return done(error);
		} else {
			return done(false);
		}
	});
};

module.exports = {
	create: create,
};
