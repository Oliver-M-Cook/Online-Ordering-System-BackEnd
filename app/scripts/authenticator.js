const users = require('../models/user.models');

// Function accepts roles that can be passed
const checkAuth = function (requiredRoleArray) {
	// The return function uses the request to process role
	// Uses the next callback function if the role is matched
	return function (req, res, next) {
		const authToken = req.get('X-Authorization');
		users.getRoleFromToken(authToken, (error, result) => {
			if (error || !result.roleID) {
				// 401 code is unauthorized
				return res.sendStatus(401);
			} else if (!requiredRoleArray.includes(result.roleID)) {
				return res.sendStatus(401);
			}
			next();
		});
	};
};

//Exports the function so it can be access in other files
module.exports = {
	checkAuth: checkAuth,
};
