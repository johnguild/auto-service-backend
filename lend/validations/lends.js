const { body } = require('express-validator')

const validate = () => {
    return [
        body('toolId')
            .isUUID().withMessage('Invalid toolId'), 
        body('mechanicId')
            .isUUID().withMessage('Invalid toolId'), 
        body('quantity')
            .isInt({ min: 1 }).withMessage('Quantity must be a number'),
   ]
}


module.exports = validate