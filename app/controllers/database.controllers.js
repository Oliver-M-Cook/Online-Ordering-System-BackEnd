const database = require('../models/database.models');

// Handles the create request
const create = (req, res) => {
	database.create((error) => {
		// Sends back a status code depending on the results
		if (error) {
			return res.sendStatus(500);
		} else {
			return res.sendStatus(200);
		}
	});
};

// Exports the function so it can be used outside this file
module.exports = {
	create: create,
};
