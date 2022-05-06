const db = require('../../config/db');
const users = require('../models/user.models');
const restaurants = require('../models/restaurant.models');

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

const getTablesWithOrders = (restaurantID, done) => {
	db.getPool().query(
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

const getOrders = (restaurantID, roleID, authToken, done) => {
	const orders = [];
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
								console.log(result);
								for (let i = 0; i < result.length; i++) {
									for (let j = 0; j < orders.length; j++) {
										if (orders[j].tableNumber === result[i].tableNumber) {
											const tempOrder = {
												orderID: result[i].orderID,
												itemName: result[i].itemName,
												quantity: result[i].quantity,
											};

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

module.exports = {
	create: create,
	getOrders: getOrders,
	deleteOrderUsingTable: deleteOrderUsingTable,
};
