const db = require('../../config/db');
const users = require('../models/user.models');
const restaurants = require('../models/restaurant.models');

// Creates an order using orderData sent from controller
const create = (orderData, authToken, done) => {
	users.getIdFromToken(authToken, function (error, userID) {
		if (error) {
			return done(error);
		} else {
			const values = [
				[
					orderData.tableNumber,
					userID,
					orderData.restaurantID,
					orderData.itemID,
					orderData.quantity,
				],
			];

			db.getPool().query(
				'INSERT INTO orders (tableNumber, userID, restaurantID, itemID, quantity) VALUES (?)',
				values,
				function (error, result) {
					if (error) {
						return done(error);
					} else {
						return done(null);
					}
				}
			);
		}
	});
};

// Gets an array of table numbers that have orders linked to them
const getTablesWithOrders = (restaurantID, done) => {
	db.getPool().query(
		// Distinct keyword removes duplicate entries of the same table number
		'SELECT DiSTINCT tableNumber FROM orders WHERE restaurantID = ?',
		restaurantID,
		function (error, result) {
			if (error) {
				return done(error);
			} else {
				return done(null, result);
			}
		}
	);
};

// Gets the orders for a specified restaurant
const getOrders = (restaurantID, roleID, authToken, done) => {
	const orders = [];
	// Checks if the user works at the restaurant
	restaurants.checkStaff(
		roleID,
		restaurantID,
		authToken,
		function (error, result) {
			if (error) {
				return done(error);
			} else if (result) {
				getTablesWithOrders(restaurantID, function (error, result) {
					if (error || result.length < 1) {
						return done(error);
					} else {
						// Formats the tables so each table gets the right order in JSON format
						for (let i = 0; i < result.length; i++) {
							tableOrder = {};
							tableOrder.tableNumber = result[i].tableNumber;
							tableOrder.orders = [];
							orders.push(tableOrder);
						}

						let query = 'SELECT orderID, itemName, quantity, tableNumber FROM ';
						query += 'orders INNER JOIN items ON items.itemID = orders.itemID ';
						query += 'WHERE orders.restaurantID = ' + restaurantID;

						db.getPool().query(query, function (error, result) {
							if (error || result.length < 1) {
								return done(error);
							} else {
								// loops through results and tables to filter the orders for each table
								for (let i = 0; i < result.length; i++) {
									for (let j = 0; j < orders.length; j++) {
										if (orders[j].tableNumber === result[i].tableNumber) {
											// Creates a temporary JSON object that holds the order information
											const tempOrder = {
												orderID: result[i].orderID,
												itemName: result[i].itemName,
												quantity: result[i].quantity,
											};

											// Adds the order to the correct table order array
											orders[j].orders.push(tempOrder);
										}
									}
								}
								return done(null, orders);
							}
						});
					}
				});
			}
		}
	);
};

// Deletes the orders using the table number
const deleteOrderUsingTable = (
	restauarantID,
	roleID,
	tableNumber,
	authToken,
	done
) => {
	restaurants.checkStaff(
		roleID,
		restauarantID,
		authToken,
		function (error, isStaff) {
			if (error) {
				return done(error);
			} else if (isStaff) {
				const values = [restauarantID, tableNumber];
				db.getPool().query(
					'DELETE FROM orders WHERE restaurantID = ? AND tableNumber = ?',
					values,
					function (error, result) {
						if (error) {
							return done(error);
						} else {
							return done(null, 'The tables order has been cleared');
						}
					}
				);
			}
		}
	);
};

// Exports the functions so they can be used outside of this file
module.exports = {
	create: create,
	getOrders: getOrders,
	deleteOrderUsingTable: deleteOrderUsingTable,
};
