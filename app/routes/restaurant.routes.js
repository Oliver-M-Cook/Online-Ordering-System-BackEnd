const restaurants = require('../controllers/restaurant.controllers');
const auth = require('../scripts/authenticator');

module.exports = function (app) {
	app
		.route('/restaurant')
		.post(auth.checkAuth([5]), restaurants.create)
		.get(auth.checkAuth([1, 5]), restaurants.getRestaurants);

	app
		.route('/restaurant/:restID')
		.get(auth.checkAuth([5]), restaurants.getOneRestaurant)
		.delete(auth.checkAuth([5]), restaurants.remove)
		.put(auth.checkAuth([5]), restaurants.updateRestaurant);

	app
		.route('/restaurant/:restID/waiter')
		.post(auth.checkAuth([4]), restaurants.addStaff(2))
		.get(auth.checkAuth([4]), restaurants.getStaff(2));

	app
		.route('/restaurant/:restID/waiter/:userID')
		.get(auth.checkAuth([4]), restaurants.getOneStaff(2))
		.delete(auth.checkAuth([4]), restaurants.removeStaff(2));

	app
		.route('/restaurant/:restID/kitchen')
		.post(auth.checkAuth([4]), restaurants.addStaff(3))
		.get(auth.checkAuth([4]), restaurants.getStaff(3));

	app
		.route('/restaurant/:restID/kitchen/:userID')
		.get(auth.checkAuth([4]), restaurants.getOneStaff(3))
		.delete(auth.checkAuth([4]), restaurants.removeStaff(3));
};
