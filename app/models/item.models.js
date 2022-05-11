const db = require('../../config/db');
const restaurants = require('../models/restaurant.models');

// Adds an item to the database using the given information
const addItem = (itemData, authToken, done) => {
	// Checks if the user is the manager
	restaurants.checkManager(
		itemData.restaurantID,
		authToken,
		function (error, manager) {
			if (error) {
				return done(error);
			} else if (!manager) {
				return done('Not manager of restaurant');
			} else {
				// Formats the values ready to be inserted
				const values = [
					[
						itemData.itemName,
						itemData.price,
						itemData.calories,
						itemData.category,
						itemData.restaurantID,
					],
				];

				// Query is setup here because it is large
				let query = 'INSERT INTO items ';
				query += '(itemName, price, calories, category, restaurantID) ';
				query += 'VALUES (?) ';

				db.getPool().query(query, values, function (error, result) {
					if (error) {
						return done(error);
					} else {
						return done(null, 'Added Item Successfully');
					}
				});
			}
		}
	);
};

// Gets Items using the restaurant ID that is passed through
const getItemsUsingRestID = (restaurantID, done) => {
	const value = [restaurantID];

	db.getPool().query(
		'SELECT itemID, itemName, price, calories, category FROM items WHERE restaurantID = ?',
		value,
		function (error, results) {
			if (error) {
				return done(error);
			} else {
				return done(null, results);
			}
		}
	);
};

// Gets a singular item using the restaurant ID and itemID
const getOneItem = (restaurantID, itemID, done) => {
	const values = [restaurantID, itemID];

	let query = 'SELECT itemID, itemName, price, calories, category FROM items ';
	query += 'WHERE restaurantID = ? AND itemID = ?';

	db.getPool().query(query, values, function (error, result) {
		if (error) {
			return done(error);
		} else if (result < 1) {
			return done('No item found with ID: ' + itemID);
		} else {
			return done(null, result[0]);
		}
	});
};

// Updates an already existing item with new data
const updateItem = (itemData, authToken, done) => {
	restaurants.checkManager(
		itemData.restaurantID,
		authToken,
		function (error, manager) {
			if (error) {
				return done(error);
			} else if (!manager) {
				return done('Not manager of restaurant');
			} else {
				const values = [
					itemData.itemName,
					itemData.price,
					itemData.calories,
					itemData.category,
					itemData.itemID,
				];

				let query = 'UPDATE items SET itemName = ?, price = ?, calories = ?, ';
				query += 'category = ? WHERE itemID = ?';

				db.getPool().query(query, values, function (error, result) {
					if (error) {
						return done(error);
					} else {
						return done(null, 'Successfully Updated Item');
					}
				});
			}
		}
	);
};

// Deletes item from database given restaurantID and itemID
const deleteItem = (itemID, restaurantID, authToken, done) => {
	// Checks the manager because the manager should be the only one to remove items
	restaurants.checkManager(restaurantID, authToken, function (error, manager) {
		if (error) {
			return done(error);
		} else if (!manager) {
			return done('Not manager of restaurant');
		} else {
			db.getPool().query(
				'DELETE FROM items WHERE itemID = ?',
				itemID,
				function (error, result) {
					if (error) {
						return done(error);
					} else {
						return done(null, 'Successfully Deleted Item');
					}
				}
			);
		}
	});
};

// Exports the functions so they can be called in other files
module.exports = {
	addItem: addItem,
	getItemsUsingRestID: getItemsUsingRestID,
	getOneItem: getOneItem,
	updateItem: updateItem,
	deleteItem: deleteItem,
};
