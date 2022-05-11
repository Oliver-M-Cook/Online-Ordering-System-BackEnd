const db = require('../../config/db');
const crypto = require('crypto');

// Hashes password using crypto library
const hashPassword = function (password) {
	const hash = crypto.createHash('md5');
	hash.update(password);
	return hash.digest('hex');
};

// Gets the ID from the authToken linked to a user
const getIdFromToken = function (authToken, done) {
	if (!authToken) {
		return done(true, null);
	} else {
		db.getPool().query(
			'SELECT userID FROM users WHERE authToken = ?',
			[authToken],
			function (error, result) {
				if (result.length === 1) {
					return done(null, result[0].userID);
				} else {
					return done(error, null);
				}
			}
		);
	}
};

// Gets the role from the authToken
const getRoleFromToken = function (authToken, done) {
	let query = 'SELECT roleID, restaurantID FROM users ';
	query += 'INNER JOIN roleUserLink rul ON users.userID = rul.userID ';
	query += 'WHERE authToken = "' + authToken + '"';

	db.getPool().query(query, function (error, result) {
		if (result.length === 1) {
			return done(null, result[0]);
		} else {
			return done('Server Error', null);
		}
	});
};

// Adds a new user to the database
const addUser = function (user, done) {
	// Hashes the password passed to the function
	const hash = hashPassword(user.password);

	const values = [[user.username, user.firstName, user.lastName, hash]];

	// Checks if the username exists already
	checkUsername(user.username, function (error, exists) {
		if (error || exists) {
			return done('Username already exists');
		} else {
			db.getPool().query(
				'INSERT INTO users (username, firstName, lastName, password) VALUES (?)',
				values,
				function (error, results) {
					if (error) {
						return done(error);
					} else {
						return done(error, results.insertId);
					}
				}
			);
		}
	});
};

// Adds a user and links that user to a role in the database
const linkRole = function (user, done) {
	addUser(user, function (error, userID) {
		if (error) {
			return done(error);
		} else {
			const values = [[userID, user.roleID, user.restaurantID]];
			db.getPool().query(
				'INSERT INTO roleUserLink (userID, roleID, restaurantID) VALUES (?)',
				values,
				function (error, results) {
					if (error) {
						return done(error);
					} else {
						return done(error, userID);
					}
				}
			);
		}
	});
};

// Updates the authToken with a new authToken
const setAuthToken = function (userID, done) {
	const token = crypto.randomBytes(16).toString('hex');
	db.getPool().query(
		'UPDATE users SET authToken = ? WHERE userID = ?',
		[token, userID],
		function (error) {
			return done(error, token);
		}
	);
};

// Gets the authToken from a userID
const getAuthToken = function (userID, done) {
	db.getPool().query(
		'SELECT authToken FROM users WHERE userID = ?',
		[userID],
		function (error, results) {
			if (results.length === 1 && results[0].authToken) {
				return done(null, results[0].authToken);
			} else {
				return done(null, null);
			}
		}
	);
};

// Removes the token linked to a user
const removeAuthToken = function (userID, done) {
	db.getPool().query(
		'UPDATE users SET authToken = null WHERE userID = ?',
		[userID],
		function (error) {
			return done(error);
		}
	);
};

// Checks login details that passed to the function
const checkLogin = function (username, password, done) {
	db.getPool().query(
		'SELECT userID, password FROM users WHERE username = ?',
		[username],
		function (error, results) {
			if (error || results.length !== 1) {
				return done('Incorrect Username');
			} else {
				if (results[0].password === hashPassword(password)) {
					return done(false, results[0].userID);
				} else {
					return done('Incorrect Password');
				}
			}
		}
	);
};

// Removes all the staff of a restaurant
const removeUsersUsingRestID = function (restaurantID, done) {
	let query = 'DELETE FROM users WHERE userID IN ';
	query += '(SELECT userID FROM roleUserLink ';
	query += 'WHERE restaurantID = ' + restaurantID + ')';

	db.getPool().query(query, function (error) {
		if (error) {
			return done(error);
		} else {
			return done();
		}
	});
};

// Checks if the username already exists in the system
const checkUsername = function (username, done) {
	const values = [[username]];

	db.getPool().query(
		'SELECT userID FROM users WHERE username = ?',
		values,
		function (error, results) {
			if (error || results.length === 1) {
				return done(error, true);
			} else {
				return done(null, false);
			}
		}
	);
};

// Gets one user using userID
const getOneUser = function (userID, done) {
	const values = [[userID]];

	db.getPool().query(
		'SELECT userID, username, firstName, lastName FROM users WHERE userID = ?',
		values,
		function (error, results) {
			if (error || results.length < 1) {
				return done(error, null);
			} else {
				return done(null, results[0]);
			}
		}
	);
};

// Removes a user from the database using the userID
const removeUser = (userID, done) => {
	const values = [userID];

	db.getPool().query(
		'DELETE FROM users WHERE userID = ?',
		values,
		function (error, result) {
			if (error) {
				return done(error, false);
			} else {
				return done(null, 'Successfully Deleted User');
			}
		}
	);
};

// Clears the authToken from the database
const clearAuthToken = (authToken, done) => {
	getIdFromToken(authToken, function (error, userID) {
		if (error || !userID) {
			return done('Something went wrong');
		} else {
			db.getPool().query(
				'UPDATE users SET authToken = null WHERE userID = ?',
				[userID],
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

// Exports all the functions that are needed in other files
module.exports = {
	addUser: addUser,
	getIdFromToken: getIdFromToken,
	getRoleFromToken: getRoleFromToken,
	setAuthToken: setAuthToken,
	getAuthToken: getAuthToken,
	removeAuthToken: removeAuthToken,
	checkLogin: checkLogin,
	linkRole: linkRole,
	removeUsersUsingRestID: removeUsersUsingRestID,
	checkUsername: checkUsername,
	getOneUser: getOneUser,
	removeUser: removeUser,
	clearAuthToken: clearAuthToken,
};
