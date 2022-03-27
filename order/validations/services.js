const { body, param } = require('express-validator')

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('services')
            .default([])
            .isArray().withMessage('Services must be an array of object')
            .isLength({ min: 1 }).withMessage('Add atleast 1 service'),
        body('services.*.id')
            .isUUID().withMessage('Services Id are invalid'), 
        body('services.*.price')
            .isNumeric().withMessage('Services price are invalid'), 
        body('services.*.addedProducts')
            .default([])
            .isArray().withMessage('Products must be an array of object'), 
        body('services.*.addedProducts.*.id')
            .isUUID().withMessage('Product Id are invalid'), 
        body('services.*.addedProducts.*.price')
            .isNumeric().withMessage('Product price are invalid'), 
        body('services.*.addedProducts.*.quantity')
            .isNumeric().withMessage('Product quantity are invalid'), 
   ]
}


module.exports = validate