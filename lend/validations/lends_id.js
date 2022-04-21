const { body, param } = require('express-validator');

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('quantity')
            .isInt({ min: 1 }).withMessage('Quantity must be a number'),
   ]
}


module.exports = validate