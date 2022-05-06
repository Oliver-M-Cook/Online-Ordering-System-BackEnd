const auth = require('../scripts/authenticator');
const orders = require('../controllers/order.controllers');

module.exports = function (app) {
	app
		.route('/restaurant/:restID/order')
		.post(auth.checkAuth([1, 2]), orders.create)
		.get(auth.checkAuth([3]), orders.getOrders);

	app
		.route('/restaurant/:restID/table/:tableNum')
		.delete(auth.checkAuth([3]), orders.clearTable);
};
