const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv').config();
const config = require('./config/config');
const db = require('./config/db');

// Creates the express app using express library
const app = express();

// Sets the app so it can parse JSON objects
app.use(bodyParser.json());

// Enables cors which allows requests from addresses other than its own
app.use(cors());

// Loads the routes into the app so they can be called
require('./app/routes/database.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/restaurant.routes')(app);
require('./app/routes/item.routes')(app);
require('./app/routes/order.routes')(app);

// Connects to the database or exits the program if the connection fails
db.connect(function (err) {
	if (err) {
		console.log(err);
		process.exit(1);
	} else {
		const port = 3000;
		app.listen(port, function () {
			console.log('Listening on port: ' + port);
		});
	}
});
