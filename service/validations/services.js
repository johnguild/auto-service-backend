const { body } = require('express-validator')

const validate = () => {
    return [
        body('title')
            .isLength({ min: 1, max: 300 }).withMessage('Title must be a 2-300 characters only'), 
        body('description')
            .isLength({ min: 1, max: 3000 }).withMessage('Description must be a 2-3000 characters only'), 
        body('cover')
            .optional()
            .isBase64().withMessage('Cover must be a base64 string'),
        body('price')
            .default(0.0)
            .isFloat({ min: 1 }).withMessage('Price must be a number'),
        body('discountedPrice')
            .optional()
            .isFloat({ min: 1 }).withMessage('Discounted Price must be a number'),
        body('isPublic')
            .optional()
            .isBoolean().withMessage("isPublic must be a boolean"),
        body('products')
            .default([])
            .isArray().withMessage('Products must be an array of uuid'), 
        body('products.*')
            .isUUID().withMessage('Products are invalid'), 
   ]
}


module.exports = validate