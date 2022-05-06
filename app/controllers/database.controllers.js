const database = require('../models/database.models');

const create = (req, res) => {
	database.create((error) => {
		if (error) {
			return res.sendStatus(500);
		} else {
			return res.sendStatus(200);
		}
	});
};

module.exports = {
	create: create,
};
