const { body } = require('express-validator')

const validate = () => {
    return [
        body('name')
            .isLength({ min: 1, max: 300 }).withMessage('Name must be a 2-300 characters only'), 
        body('description')
            .isLength({ min: 1, max: 3000 }).withMessage('Description must be a 2-3000 characters only'), 
        body('cover')
            .optional()
            .isBase64().withMessage('Cover must be a base64 string'),
        body('quantity')
            .default(0)
            .isNumeric().withMessage('Quantity must be a number'),
   ]
}


module.exports = validate