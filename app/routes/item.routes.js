const auth = require('../scripts/authenticator');
const items = require('../controllers/item.controllers');

module.exports = function (app) {
	app
		.route('/restaurant/:restID/item')
		.post(auth.checkAuth([4]), items.create)
		.get(auth.checkAuth([1, 2, 4]), items.getItems);

	app
		.route('/restaurant/:restID/item/:itemID')
		.get(auth.checkAuth([1, 2, 4]), items.getOneItem)
		.put(auth.checkAuth([4]), items.updateItem)
		.delete(auth.checkAuth([4]), items.deleteItem);
};
