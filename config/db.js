const mysql = require('mysql');
const config = require('./config.js');

let pool = null;

exports.connect = function (done) {
	pool = mysql.createPool(config.db);
	done();
};

exports.getPool = function () {
	return pool;
};
