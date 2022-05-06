const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv').config();
const config = require('./config/config');
const db = require('./config/db');

const app = express();

app.use(bodyParser.json());

app.use(cors());

require('./app/routes/database.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/restaurant.routes')(app);
require('./app/routes/item.routes')(app);
require('./app/routes/order.routes')(app);

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
