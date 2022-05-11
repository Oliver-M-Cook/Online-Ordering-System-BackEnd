const items = require('../models/item.models');

// Handles the create item requesrt
const create = (req, res) => {
	const itemData = req.body;
	itemData.restaurantID = req.params.restID;
	// Gets the authToken from the request headers
	const authToken = req.get('X-Authorization');

	let validationPass = true;

	// Simple validation to make sure there are no blank fields
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

// Handles getting the items from a restaurant
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

// Handles getting a single item from the database
const getOneItem = (req, res) => {
	// Gets the parameters from the request
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

// Handles updating an item
const updateItem = (req, res) => {
	// Collects all the data neccessary to update an item
	const itemData = req.body;
	itemData.restaurantID = req.params.restID;
	itemData.itemID = req.params.itemID;
	const authToken = req.get('X-Authorization');

	// Checks if any fields are blank
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

// Handles deleting items from the database
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

// Exports the functions so they can be used outside of the file
module.exports = {
	create: create,
	getItems: getItems,
	getOneItem: getOneItem,
	updateItem: updateItem,
	deleteItem: deleteItem,
};
