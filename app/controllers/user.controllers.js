const users = require('../models/user.models');

// Handles creatng new users
const create = (roleID, restaurantID) => {
	return function (req, res) {
		const user = req.body;
		user.roleID = roleID;
		// RestaurantID can be null because customers are not bound by a restaurant
		user.restaurantID = restaurantID;
		users.linkRole(user, function (error, id) {
			if (error) {
				console.log(error);
				res.status(400).send(error);
			} else {
				res.status(201).send({ id: id });
			}
		});
	};
};

// Handles logging the user into their account
const login = (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (username && password) {
		users.checkLogin(username, password, function (error, id) {
			if (error) {
				res.status(400).send(error);
			} else {
				// Handles the authToken generation
				users.getAuthToken(id, function (error, authToken) {
					if (authToken) {
						users.getRoleFromToken(authToken, function (error, result) {
							if (error) {
								res.status(400).send(error);
							} else {
								res.send({
									authToken: authToken,
									roleID: result.roleID,
									restaurantID: result.restaurantID,
								});
							}
						});
					} else {
						users.setAuthToken(id, function (error, authToken) {
							users.getRoleFromToken(authToken, function (error, result) {
								if (error) {
									res.status(400).send(error);
								} else {
									res.send({
										authToken: authToken,
										roleID: result.roleID,
										restaurantID: result.restaurantID,
									});
								}
							});
						});
					}
				});
			}
		});
	} else {
		res.status(400).send('Invalid Login Credentials');
	}
};

// Handles logging out the user
const logout = (req, res) => {
	const authToken = req.get('X-Authorization');

	users.clearAuthToken(authToken, function (error) {
		if (error) {
			res.status(500).send(error);
		} else {
			res.sendStatus(200);
		}
	});
};

// Exports functions so they can called outside this file
module.exports = {
	create: create,
	login: login,
	logout: logout,
};
