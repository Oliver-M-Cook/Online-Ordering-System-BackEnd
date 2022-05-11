const mysql = require('mysql');
const config = require('./config.js');

let pool = null;

// Handles connecting to database
const connect = (done) => {
	// creates a database pool to handle queries
	pool = mysql.createPool(config.db);
	done();
};

// Returns the pool to where the function was called
const getPool = () => {
	return pool;
};

// Exports the functions so they can be used outside of this file
module.exports = {
	connect: connect,
	getPool: getPool,
};
