const { logout } = require('../controllers/user.controllers');
const users = require('../controllers/user.controllers');
const auth = require('../scripts/authenticator');

//Creates the routes that can be used to access the API
module.exports = function (app) {
	app.route('/user/customer').post(users.create(1));

	app.route('/login').post(users.login);

	app.route('/logout').put(auth.checkAuth([1, 2, 3, 4, 5]), logout);
};
