const orders = require('../models/order.models');

const create = (req, res) => {
	const orderData = req.body;
	const authToken = req.get('X-Authorization');
	const restaurantID = req.params.restID;

	let orderFailed = false;
	let errorOccur = false;

	for (let i = 0; i < orderData.length; i++) {
		orderData[i].restaurantID = restaurantID;
		if (
			orderData[i].tableNumber &&
			orderData[i].itemID &&
			orderData[i].quantity
		) {
			orders.create(orderData[i], authToken, function (error) {
				if (error) {
					errorOccur = true;

					if (i == orderData.length - 1 && errorOccur) {
						res.status(500).send('A server error has occurred');
					}
				} else {
					if (i == orderData.length - 1 && !errorOccur) {
						res.status(201).send('Order has been sent to server');
					}
				}
			});
		} else {
			orderFailed = true;
		}
	}
	if (orderFailed) {
		res.status(400).send('Missing parts of an Order, consult waiter');
	}
};

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

module.exports = {
	create: create,
	getOrders: getOrders,
	clearTable: clearTable,
};
