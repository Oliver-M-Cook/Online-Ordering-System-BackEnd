const { response } = require('express');
const restaurants = require('../models/restaurant.models');

const create = (req, res) => {
	const data = req.body;

	if (
		data.restaurantName &&
		data.username &&
		data.firstName &&
		data.lastName &&
		data.password
	) {
		restaurants.addRestaurant(data, function (error) {
			if (error) {
				res.status(500).send(error);
			} else {
				res.status(201).send('Restaurant Added Successfully');
			}
		});
	} else {
		res.status(400).send('Missing Restaurant Data');
	}
};

const remove = (req, res) => {
	const restaurantID = req.params.restID;

	restaurants.removeRestaurant(restaurantID, function (error) {
		if (error) {
			res.status(500).send(error);
		} else {
			res.sendStatus(200);
		}
	});
};

const getRestaurants = (req, res) => {
	restaurants.getRestaurants(function (error, results) {
		if (error) {
			res.status(500).send(error);
		} else {
			res.status(200).send(results);
		}
	});
};

const getOneRestaurant = (req, res) => {
	const restaurantID = req.params.restID;

	restaurants.getOneRestaurant(restaurantID, function (error, results) {
		if (error) {
			res.status(500).send(error);
		} else {
			res.status(200).send(results);
		}
	});
};

const updateRestaurant = (req, res) => {
	const restaurantID = req.params.restID;

	const data = req.body;
	data.restaurantID = restaurantID;

	if (data.restaurantName) {
		restaurants.updateRestaurant(data, function (error) {
			if (error) {
				res.status(500).send(error);
			} else {
				res.status(200).send('Updated');
			}
		});
	} else {
		res.status(400).send('Missing Restaurant Data');
	}
};

const addStaff = (roleID) => {
	return function (req, res) {
		const restaurantID = req.params.restID;
		const authToken = req.get('X-Authorization');
		const userData = req.body;
		userData.restaurantID = restaurantID;
		userData.roleID = roleID;

		if (
			userData.firstName &&
			userData.lastName &&
			userData.username &&
			userData.password
		) {
			restaurants.addStaff(authToken, userData, function (error) {
				if (error) {
					res.status(500).send(error);
				} else {
					res.status(201).send('Added User Successfully');
				}
			});
		} else {
			res.status(400).send('Missing Staff Data');
		}
	};
};

const getWaiters = (req, res) => {
	const restaurantID = req.params.restID;
	const authToken = req.get('X-Authorization');

	restaurants.getWaiters(restaurantID, authToken, function (error, results) {
		if (error || !results) {
			res.status(500).send(error);
		} else {
			res.status(200).send(results);
		}
	});
};

const getStaff = (roleID) => {
	return function (req, res) {
		const restaurantID = req.params.restID;
		const authToken = req.get('X-Authorization');

		restaurants.getStaff(
			restaurantID,
			roleID,
			authToken,
			function (error, results) {
				if (error) {
					res.status(500).send(error);
				} else {
					res.status(200).send(results);
				}
			}
		);
	};
};

const getOneStaff = (roleID) => {
	return function (req, res) {
		const restaurantID = req.params.restID;
		const userID = req.params.userID;
		const authToken = req.get('X-Authorization');

		restaurants.getOneStaff(
			restaurantID,
			userID,
			authToken,
			roleID,
			function (error, result) {
				if (error || !result) {
					res.status(500).send(error);
				} else {
					res.status(200).send(result);
				}
			}
		);
	};
};

const removeStaff = (roleID) => {
	return function (req, res) {
		const restaurantID = req.params.restID;
		const waiterID = req.params.userID;
		const authToken = req.get('X-Authorization');

		restaurants.removeStaff(
			restaurantID,
			waiterID,
			roleID,
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
};

module.exports = {
	create: create,
	remove: remove,
	getRestaurants: getRestaurants,
	getOneRestaurant: getOneRestaurant,
	updateRestaurant: updateRestaurant,
	addStaff: addStaff,
	getStaff: getStaff,
	getOneStaff: getOneStaff,
	removeStaff: removeStaff,
};
