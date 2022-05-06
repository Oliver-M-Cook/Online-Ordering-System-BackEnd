const config = {
	db: {
		host: process.env.HOST,
		port: process.env.PORT,
		user: process.env.USERNAME,
		password: process.env.PASSWORD,
		database: process.env.USERNAME,
		multipleStatements: true,
	},
};

module.exports = config;
