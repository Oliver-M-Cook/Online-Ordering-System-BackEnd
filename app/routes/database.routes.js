const database = require('../controllers/database.controllers');

module.exports = function (app) {
	app.route('/database/create').post(database.create);
};
