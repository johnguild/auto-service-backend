const { body, param } = require('express-validator');

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('quantity')
            .isInt({ min: 1 }).withMessage('Quantity must be a number'),
        body("remarks")
            .default('')
            .isString().withMessage('remarks must be a string')
            .isLength({ max: 300 }).withMessage('remarks exceed the maximum 300 chars')
   ]
}


module.exports = validate