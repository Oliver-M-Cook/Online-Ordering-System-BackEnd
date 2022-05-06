const db = require('../../config/db');
const users = require('../models/user.models');

const addRestaurant = (data, done) => {
	const values = [[data.restaurantName]];

	users.checkUsername(data.username, function (error, exists) {
		if (error || exists) {
			if (exists) {
				return done('Username already exists');
			} else {
				return done(error);
			}
		} else {
			db.getPool().query(
				'INSERT INTO restaurants (restaurantName) VALUES (?)',
				values,
				function (error, results) {
					if (error) {
						return done(error);
					} else {
						data.roleID = 4;
						data.restaurantID = results.insertId;
						users.linkRole(data, function (error, id) {
							if (error) {
								return done(error);
							} else {
								return done(error, results.insertId);
							}
						});
					}
				}
			);
		}
	});
};

const removeRestaurant = (restaurantID, done) => {
	const values = [[restaurantID]];

	users.removeUsersUsingRestID(restaurantID, function (error) {
		if (error) {
			return done(error);
		} else {
			db.getPool().query(
				'DELETE FROM restaurants WHERE restaurantID = ?',
				values,
				function (error) {
					if (error) {
						return done(error);
					} else {
						return done();
					}
				}
			);
		}
	});
};

const getRestaurants = (done) => {
	let query = 'SELECT r.restaurantID, restaurantName, userID AS managerID ';
	query += 'FROM restaurants r ';
	query += 'INNER JOIN roleUserLink rul ON r.restaurantID = rul.restaurantID ';
	query += 'WHERE roleID = 4';

	db.getPool().query(query, function (error, results) {
		if (error) {
			return done(error, null);
		} else {
			console.log(results);
			return done(null, results);
		}
	});
};

const getOneRestaurant = (restaurantID, done) => {
	const values = [[restaurantID]];

	let query = 'SELECT r.restaurantID, restaurantName, userID ';
	query += 'FROM restaurants r ';
	query += 'INNER JOIN roleUserLink rul ON r.restaurantID = rul.restaurantID ';
	query += 'WHERE roleID = 4 AND r.restaurantID = ?';

	db.getPool().query(query, values, function (error, results) {
		if (error || results < 1) {
			return done(error, null);
		} else {
			const data = results[0];
			users.getOneUser(data.userID, function (error, result) {
				if (error) {
					return done(error, null);
				} else {
					data.username = result.username;
					data.firstName = result.firstName;
					data.lastName = result.lastName;

					return done(null, data);
				}
			});
		}
	});
};

const updateRestaurant = (data, done) => {
	const values = [data.restaurantName, data.restaurantID];

	db.getPool().query(
		'UPDATE restaurants SET restaurantName = ? WHERE restaurantID = ?',
		values,
		function (error, result) {
			if (error) {
				return done(error);
			} else {
				console.log(result);
				return done(null);
			}
		}
	);
};

const checkManager = (restaurantID, authToken, done) => {
	users.getIdFromToken(authToken, function (error, userID) {
		if (error) {
			return done(error, false);
		} else {
			getOneRestaurant(restaurantID, function (error, result) {
				if (error || !result) {
					return done(error, false);
				} else {
					if (userID === result.userID) {
						return done(null, true);
					} else {
						return done(null, false);
					}
				}
			});
		}
	});
};

const checkStaff = (roleID, restaurantID, authToken, done) => {
	users.getIdFromToken(authToken, function (error, userID) {
		if (error) {
			return done(error);
		} else {
			const values = [roleID, restaurantID, userID];

			db.getPool().query(
				'SELECT * FROM roleUserLink WHERE roleID = ? AND restaurantID = ? AND userID = ?',
				values,
				function (error, result) {
					if (error || result.length < 1) {
						return done('Not required role at the restaurant');
					} else {
						return done(null, true);
					}
				}
			);
		}
	});
};

const addStaff = (authToken, user, done) => {
	checkManager(user.restaurantID, authToken, function (error, manager) {
		if (error) {
			return done(error);
		} else {
			if (!manager) {
				return done('Not manager of restaurant');
			} else {
				users.linkRole(user, function (error) {
					if (error) {
						return done(error);
					} else {
						return done(null);
					}
				});
			}
		}
	});
};

const getStaff = (restaurantID, roleID, authToken, done) => {
	checkManager(restaurantID, authToken, function (error, manager) {
		if (error) {
			return done(error);
		} else {
			if (!manager) {
				return done('Not manager of restaurant');
			} else {
				let query =
					'SELECT users.userID, firstName, lastName, username, roleID FROM users ';
				query += 'INNER JOIN roleUserLink rul ON users.userID = rul.userID ';
				query += 'WHERE roleID = ? AND restaurantID = ?';

				const values = [roleID, restaurantID];

				db.getPool().query(query, values, function (error, results) {
					if (error || results.length < 1) {
						return done(error, null);
					} else {
						return done(null, results);
					}
				});
			}
		}
	});
};

const getOneStaff = (restaurantID, userID, authToken, roleID, done) => {
	checkManager(restaurantID, authToken, function (error, manager) {
		if (error) {
			return done(error);
		} else {
			if (!manager) {
				return done('Not manager of restaurant');
			} else {
				const values = [roleID, restaurantID, userID];
				let query = 'SELECT users.userID, firstName, lastName FROM users ';
				query += 'INNER JOIN roleUserLink rul ON users.userID = rul.userID ';
				query += 'WHERE roleID = ? AND restaurantID = ? ';
				query += 'AND users.userID = ?';

				db.getPool().query(query, values, function (error, results) {
					if (error || results.length < 1) {
						return done(error, null);
					} else {
						return done(null, results);
					}
				});
			}
		}
	});
};

const removeStaff = (restaurantID, userID, roleID, authToken, done) => {
	checkManager(restaurantID, authToken, function (error, manager) {
		if (error) {
			return done(error);
		} else {
			if (!manager) {
				return done('Not manager of restaurant');
			} else {
				getOneStaff(
					restaurantID,
					userID,
					authToken,
					roleID,
					function (error, result) {
						if (error || result < 1) {
							return done(error);
						} else {
							users.removeUser(userID, function (error, result) {
								if (error) {
									return done(error);
								} else {
									return done(null, result);
								}
							});
						}
					}
				);
			}
		}
	});
};

module.exports = {
	addRestaurant: addRestaurant,
	removeRestaurant: removeRestaurant,
	getRestaurants: getRestaurants,
	getOneRestaurant: getOneRestaurant,
	updateRestaurant: updateRestaurant,
	addStaff: addStaff,
	getStaff: getStaff,
	getOneStaff: getOneStaff,
	removeStaff: removeStaff,
	checkManager: checkManager,
	checkStaff: checkStaff,
};
