const { body, param } = require('express-validator');

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body("remarks")
            .default('')
            .isString().withMessage('remarks must be a string')
            .isLength({ max: 300 }).withMessage('remarks exceed the maximum 300 chars')

   ]
}


module.exports = validate