const ApiResponse = require("../utils/ApiResponse");


// Attaches ApiResponse instance on the req
const api = function (action) {
    return function (req, res, next) {
        req.api = new ApiResponse(res, action);

        next()
    }
}

module.exports = api