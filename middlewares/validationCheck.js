const { validationResult } = require('express-validator');

const input = function () {
    return function (req, res, next) {

        // validate input
        const vrErrors = validationResult(req);
        if (!vrErrors.isEmpty()) {
            return req.api.status(400).errors(
                vrErrors.errors.map((e) => e.msg)
            ).send();
        }

        next()
    }
}

module.exports = input