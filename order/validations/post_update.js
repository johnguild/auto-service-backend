const { body, param } = require('express-validator')

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('discount')
            .isFloat({ min: 0 }).withMessage('Discount must be a number'),
        body('carMake')
            .isString().withMessage('Car Make is Invalid')
            .isLength({ min: 1, max: 300 }).withMessage('Car Make must be 1-300 characters only'),
        body('carType')
            .isString().withMessage('Car Type is Invalid')
            .isLength({ min: 1, max: 300 }).withMessage('Car Type must be 1-300 characters only'),
        body('carYear')
            .isString().withMessage('Car Year is Invalid')
            .isLength({ min: 1, max: 300 }).withMessage('Car Year must be 1-300 characters only'),
        body('carPlate')
            .isString().withMessage('Car Plate is Invalid')
            .isLength({ min: 1, max: 300 }).withMessage('Car Plate must be 1-300 characters only'),
        body('carOdometer')
            .isString().withMessage('Car Odometer is Invalid')
            .isLength({ min: 1, max: 300 }).withMessage('Car Odometer must be 1-300 characters only'),
        body('receiveDate')
            .isISO8601().withMessage('receiveDate is Invalid'),
        body('warrantyEnd')
            .isISO8601().withMessage('WarranyEnd is Invalid'),
        body('services')
            .default([])
            .isArray().withMessage('Services must be an array of object'), 
        body('services.*.id')
            .isUUID().withMessage('Services Id are invalid'), 
        body('services.*.price')
            .isFloat({ min: 0 }).withMessage('Services price are invalid'), 
        body('services.*.addedProducts')
            .default([])
            .isArray().withMessage('Products must be an array of object'), 
        body('services.*.addedProducts.*.id')
            .isUUID().withMessage('Product Id are invalid'), 
        body('services.*.addedProducts.*.addedStocks')
            .default([])
            .isArray().withMessage('Product addedStocks must be an array of object'), 
        body('services.*.addedProducts.*.addedStocks.*.id')
            .isUUID().withMessage('Added stock Id are invalid'), 
        body('services.*.addedProducts.*.addedStocks.*.price')
            .isFloat({ min: 0 }).withMessage('Added stock price are invalid'), 
        body('services.*.addedProducts.*.addedStocks.*.quantity')
            .isInt({ min: 0 }).withMessage('Added stock quantity are invalid'), 
        body('mechanics')
            .default([])
            .isArray().withMessage('Mechanics must be an array of object'), 
        body('mechanics.*.id')
            .isUUID().withMessage('Mechanics Id are invalid'), 
    ]
}


module.exports = validate