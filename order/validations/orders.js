const { body } = require('express-validator')

const validate = () => {
    return [
        body('customerId')
            .isUUID().withMessage('Customer is invalid'), 
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
            .isFloat({ min: 1 }).withMessage('Services price are invalid'), 
        body('services.*.addedProducts')
            .default([])
            .isArray().withMessage('Products must be an array of object'), 
        body('services.*.addedProducts.*.id')
            .isUUID().withMessage('Product Id are invalid'), 
        body('services.*.addedProducts.*.price')
            .isFloat({ min: 1 }).withMessage('Product price are invalid'), 
        body('services.*.addedProducts.*.quantity')
            .isInt({ min: 1 }).withMessage('Product quantity are invalid'), 
        body('mechanics')
            .default([])
            .isArray().withMessage('Mechanics must be an array of object'), 
        body('mechanics.*.id')
            .isUUID().withMessage('Mechanics Id are invalid'), 
        body('payment')
            .notEmpty()
                .withMessage('Payment is requried!'),
        body('payment.type')
            .isIn(['AccountsReceivable', 'Online', 'Cash', 'Cheque'])
                .withMessage('Payment type must be a either of AccountsReceivable/Online/Cash/Cheque'),
        body('payment.amount')
            .isFloat({ min: 1 })
                .withMessage('Payment Amount must be a number'),
        body('payment.bank')
            .if(body('payment.type').equals('Online')) // if payment.type is Online
            .notEmpty() // then payment.bank is also required
            .isLength({ max: 300 }) // along with the rest of the validation
                .withMessage('Payment Bank/E-Wallet must be 1-300 characters only'),
        body('payment.referenceNumber')
            .if(body('payment.type').equals('Online')) // if payment.type is Online
            .notEmpty() // then payment.referenceNumber is also required
            .isLength({ max: 300 }) // along with the rest of the validation
                .withMessage('Payment Reference Number must be 1-300 characters only'),
        body('payment.accountName')
            .if(body('payment.type').equals('Cheque')) // if payment.type is Cheque
            .notEmpty() // then payment.accountName is also required
            .isLength({ max: 300 }) // along with the rest of the validation
                .withMessage('Payment Account Name must be 1-300 characters only'),
        body('payment.accountNumber')
            .if(body('payment.type').equals('Cheque')) // if payment.type is Cheque
            .notEmpty() // then payment.accountNumber is also required
            .isLength({ max: 300 }) // along with the rest of the validation
                .withMessage('Payment Account Number must be 1-300 characters only'),
        body('payment.chequeNumber')
            .if(body('payment.type').equals('Cheque')) // if payment.type is Cheque
            .notEmpty() // then payment.accountNumber is also required
            .isLength({ max: 300 }) // along with the rest of the validation
                .withMessage('Payment Cheque Number must be 1-300 characters only'),
        // body('payment.bank')
        //     .optional()
        //     .isLength({ max: 300 })
        //         .withMessage('Payment Bank/E-Wallet must be 1-300 characters only'),
        // body('payment.referenceNumber')
        //     .optional()
        //     .isLength({ max: 300 })
        //         .withMessage('Payment Reference Number must be 1-300 characters only'),
    ]
}


module.exports = validate