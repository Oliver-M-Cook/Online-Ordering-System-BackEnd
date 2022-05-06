const db = require('../../config/db');
const restaurants = require('../models/restaurant.models');

const addItem = (itemData, authToken, done) => {
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
					[
						itemData.itemName,
						itemData.price,
						itemData.calories,
						itemData.category,
						itemData.restaurantID,
					],
				];

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

const deleteItem = (itemID, restaurantID, authToken, done) => {
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

module.exports = {
	addItem: addItem,
	getItemsUsingRestID: getItemsUsingRestID,
	getOneItem: getOneItem,
	updateItem: updateItem,
	deleteItem: deleteItem,
};
