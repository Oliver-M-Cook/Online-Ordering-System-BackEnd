const orders = require('../models/order.models');

// Handles creating new orders
const create = (req, res) => {
	const orderData = req.body;
	const authToken = req.get('X-Authorization');
	const restaurantID = req.params.restID;

	let orderFailed = false;
	let errorOccur = false;

	// Loops through the basket that has been sent
	for (let i = 0; i < orderData.length; i++) {
		orderData[i].restaurantID = restaurantID;
		// Checks if the fields are blank
		if (
			orderData[i].tableNumber &&
			orderData[i].itemID &&
			orderData[i].quantity
		) {
			orders.create(orderData[i], authToken, function (error) {
				if (error) {
					errorOccur = true;

					// On the last loop, checks if an error has occurred
					if (i == orderData.length - 1 && errorOccur) {
						res.status(500).send('A server error has occurred');
					}
				} else {
					// On the last loop, sends a status 201 if no error has occurred
					if (i == orderData.length - 1 && !errorOccur) {
						res.status(201).send('Order has been sent to server');
					}
				}
			});
		} else {
			orderFailed = true;
		}
	}
	// If this happens, some of the order has not been sent to the server
	if (orderFailed) {
		res.status(400).send('Missing parts of an Order, consult waiter');
	}
};

// Handles getting the orders from the database
const getOrders = (req, res) => {
	const authToken = req.get('X-Authorization');
	const restaurantID = req.params.restID;

	orders.getOrders(restaurantID, 3, authToken, function (error, result) {
		if (error) {
			res.status(500).send(error);
		} else {
			res.status(200).send(result);
		}
	});
};

// Handles removing orders for a specified table
const clearTable = (req, res) => {
	const authToken = req.get('X-Authorization');
	const restaurantID = req.params.restID;
	const tableNumber = req.params.tableNum;

	orders.deleteOrderUsingTable(
		restaurantID,
		3,
		tableNumber,
		authToken,
		function (error, result) {
			if (error) {
				res.status(500).send(error);
			} else {
				res.status(200).send(result);
			}
		}
	);
};

// Exports the functions so they can be used outside of the file
module.exports = {
	create: create,
	getOrders: getOrders,
	clearTable: clearTable,
};
