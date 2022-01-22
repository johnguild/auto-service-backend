const { body } = require('express-validator')

const validate = () => {
    return [
        body('customerId')
            .isUUID().withMessage('Customer is invalid'), 
        body('installments')
            .isNumeric().withMessage('Installment must be a number'),
        body('services.*')
            .isUUID().withMessage('Services are invalid'), 
        body('products.*')
            .isUUID().withMessage('Products are invalid'), 
        body('carBrand')
            .isString().withMessage('Car Brand is Invalid')
            .isLength({ min: 1, max: 300 }).withMessage('Car Brand must be 1-300 characters only'),
        body('carModel')
            .isString().withMessage('Car Model is Invalid')
            .isLength({ min: 1, max: 300 }).withMessage('Car Model must be 1-300 characters only'),
        body('carColor')
            .isString().withMessage('Car Color is Invalid')
            .isLength({ min: 1, max: 300 }).withMessage('Car Color must be 1-300 characters only'),
        body('carPlate')
            .isString().withMessage('Car Plate is Invalid')
            .isLength({ min: 1, max: 300 }).withMessage('Car Plate must be 1-300 characters only'),
   ]
}


module.exports = validate