const { clearAuthToken } = require('../models/user.models');
const users = require('../models/user.models');

const create = (roleID, restaurantID) => {
	return function (req, res) {
		const user = req.body;
		user.roleID = roleID;
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

const login = (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (username && password) {
		users.checkLogin(username, password, function (error, id) {
			if (error) {
				res.status(400).send(error);
			} else {
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

const logout = (req, res) => {
	const authToken = req.get('X-Authorization');

	clearAuthToken(authToken, function (error) {
		if (error) {
			res.status(500).send(error);
		} else {
			res.sendStatus(200);
		}
	});
};

module.exports = {
	create: create,
	login: login,
	logout: logout,
};
