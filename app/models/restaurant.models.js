const db = require('../../config/db');
const users = require('../models/user.models');

// Creates a new restaurant using the data passed through
const addRestaurant = (data, done) => {
	const values = [[data.restaurantName]];

	// Checks if the username is unique
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
						// The role is hardcoded because this will always be manager
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

// Deletes the restaurant from the database using the restaurantID
const removeRestaurant = (restaurantID, done) => {
	const values = [[restaurantID]];

	// Removes the staff that are linked to the restaurant
	users.removeUsersUsingRestID(restaurantID, function (error) {
		if (error) {
			return done(error);
		} else {
			// Deletes the restaurant from the database
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

// Gets all the restaurants from the database
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

// Gets a singular restaurant using the restaurantID
const getOneRestaurant = (restaurantID, done) => {
	const values = [[restaurantID]];

	// Query is setup here because it is quite long
	let query = 'SELECT r.restaurantID, restaurantName, userID ';
	query += 'FROM restaurants r ';
	query += 'INNER JOIN roleUserLink rul ON r.restaurantID = rul.restaurantID ';
	query += 'WHERE roleID = 4 AND r.restaurantID = ?';

	db.getPool().query(query, values, function (error, results) {
		if (error || results < 1) {
			return done(error, null);
		} else {
			const data = results[0];
			// Gets the user data from the ID that is linked to the restaurant
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

// Updates a restaurant given the data that is passed through
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

// Checks if the user logged in is the manager of the restaurant
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

// Checks if the user that is logged in works at the restaurant
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

// Adds staff member to database
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

// Gets staff with a certain role that is passed through
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

// Gets individual staff member using userID
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

// Remove a staff member using the data that is passed through
const removeStaff = (restaurantID, userID, roleID, authToken, done) => {
	checkManager(restaurantID, authToken, function (error, manager) {
		if (error) {
			return done(error);
		} else {
			if (!manager) {
				return done('Not manager of restaurant');
			} else {
				// Get one staff is used to make sure the userID passed through is a staff member
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

// Exports the functions to be used outside the file
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
