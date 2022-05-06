const users = require('../models/user.models');

const checkAuth = function (requiredRoleArray) {
	return function (req, res, next) {
		const authToken = req.get('X-Authorization');
		users.getRoleFromToken(authToken, (error, result) => {
			if (error || !result.roleID) {
				return res.sendStatus(401);
			} else if (!requiredRoleArray.includes(result.roleID)) {
				return res.sendStatus(401);
			}
			next();
		});
	};
};

module.exports = {
	checkAuth: checkAuth,
};
