const { body, param } = require('express-validator');

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('name')
            .isLength({ min: 1, max: 300 }).withMessage('Name must be a 1-300 characters only'), 
        body('sku')
            .isLength({ min: 1, max: 300 }).withMessage('SKU must be a 1-300 characters only'), 
        body('description')
            .isLength({ min: 1, max: 3000 }).withMessage('Description must be a 1-3000 characters only'), 
        body('stock')
            .optional()
            .isNumeric().withMessage('Stock must be a number'),
        body('price')
            .optional()
            .isNumeric().withMessage('Price must be a number'),
   ]
}


module.exports = validate