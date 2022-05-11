const database = require('../controllers/database.controllers');

//Creates the routes that can be used to access the API
module.exports = function (app) {
	app.route('/database/create').post(database.create);
};
