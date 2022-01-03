const { body } = require('express-validator')

const validate = () => {
    return [
        body('title')
            .isLength({ min: 2, max: 300 }).withMessage('Title must be a 2-300 characters only'), 
        body('description')
            .isLength({ min: 2, max: 3000 }).withMessage('Description must be a 2-3000 characters only'), 
        body('cover')
            .optional()
            .isBase64().withMessage('Cover must be a base64 string'),
        body('price')
            .default(0.0)
            .isNumeric().withMessage('Price must be a number'),
        body('discountedPrice')
            .optional()
            .isNumeric().withMessage('Discounted Price must be a number'),
        body('isPublic')
            .optional()
            .isBoolean().withMessage("isPublic must be a boolean"),
   ]
}


module.exports = validate