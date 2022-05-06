const items = require('../models/item.models');

const create = (req, res) => {
	const itemData = req.body;
	itemData.restaurantID = req.params.restID;
	const authToken = req.get('X-Authorization');

	let validationPass = true;

	if (
		itemData.itemName &&
		itemData.price &&
		itemData.calories &&
		itemData.category
	) {
		items.addItem(itemData, authToken, function (error, result) {
			if (error) {
				res.status(500).send(error);
			} else {
				res.status(201).send(result);
			}
		});
	} else {
		res.status(400).send('Incorrect Data Format');
	}
};

const getItems = (req, res) => {
	const restaurantID = req.params.restID;

	items.getItemsUsingRestID(restaurantID, function (error, results) {
		if (error) {
			res.status(500).send(error);
		} else {
			res.status(200).send(results);
		}
	});
};

const getOneItem = (req, res) => {
	const restaurantID = req.params.restID;
	const itemID = req.params.itemID;

	items.getOneItem(restaurantID, itemID, function (error, result) {
		if (error) {
			res.status(500).send(error);
		} else {
			res.status(200).send(result);
		}
	});
};

const updateItem = (req, res) => {
	const itemData = req.body;
	itemData.restaurantID = req.params.restID;
	itemData.itemID = req.params.itemID;
	const authToken = req.get('X-Authorization');

	if (
		itemData.itemName &&
		itemData.price &&
		itemData.calories &&
		itemData.category &&
		itemData.itemID
	) {
		items.updateItem(itemData, authToken, function (error, result) {
			if (error) {
				res.status(500).send(error);
			} else {
				res.status(200).send(result);
			}
		});
	} else {
		res.status(400).send('Incorrect Data Format');
	}
};

const deleteItem = (req, res) => {
	const restaurantID = req.params.restID;
	const itemID = req.params.itemID;
	const authToken = req.get('X-Authorization');

	items.deleteItem(itemID, restaurantID, authToken, function (error, result) {
		if (error) {
			res.status(500).send(error);
		} else {
			res.status(200).send(result);
		}
	});
};

module.exports = {
	create: create,
	getItems: getItems,
	getOneItem: getOneItem,
	updateItem: updateItem,
	deleteItem: deleteItem,
};
