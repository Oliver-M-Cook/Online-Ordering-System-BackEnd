const db = require('../../config/db');
const crypto = require('crypto');
const { get } = require('express/lib/response');

const hashPassword = function (password) {
	const hash = crypto.createHash('md5');
	hash.update(password);
	return hash.digest('hex');
};

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

const addUser = function (user, done) {
	const hash = hashPassword(user.password);

	const values = [[user.username, user.firstName, user.lastName, hash]];

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
						console.log(results.insertId);
						return done(error, results.insertId);
					}
				}
			);
		}
	});
};

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

const setAuthToken = function (id, done) {
	const token = crypto.randomBytes(16).toString('hex');
	db.getPool().query(
		'UPDATE users SET authToken = ? WHERE userID = ?',
		[token, id],
		function (error) {
			return done(error, token);
		}
	);
};

const getAuthToken = function (id, done) {
	db.getPool().query(
		'SELECT authToken FROM users WHERE userID = ?',
		[id],
		function (error, results) {
			if (results.length === 1 && results[0].authToken) {
				return done(null, results[0].authToken);
			} else {
				return done(null, null);
			}
		}
	);
};

const removeAuthToken = function (id, done) {
	db.getPool().query(
		'UPDATE users SET authToken = null WHERE userID = ?',
		[id],
		function (error) {
			return done(error);
		}
	);
};

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
