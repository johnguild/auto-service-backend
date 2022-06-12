const { body, param } = require('express-validator')

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('type')
            .isIn(['AccountsReceivable', 'Online', 'Cash', 'Cheque'])
                .withMessage('type must be a either of AccountsReceivable/Online/Cash/Cheque'),
        body('amount')
            .isFloat({ min: 1 }).withMessage('Amount must be a number'),
        body('bank')
            .if(body('type').equals('Online')) // if type is Online
            .notEmpty() // then bank is also required
            .isLength({ max: 300 }) // along with the rest of the validation
                .withMessage('Payment Bank/E-Wallet must be 1-300 characters only'),
        body('referenceNumber')
            .if(body('type').equals('Online')) // if type is Online
            .notEmpty() // then referenceNumber is also required
            .isLength({ max: 300 }) // along with the rest of the validation
                .withMessage('Payment Reference Number must be 1-300 characters only'),
        body('accountName')
            .if(body('type').equals('Cheque')) // if type is Cheque
            .notEmpty() // then accountName is also required
            .isLength({ max: 300 }) // along with the rest of the validation
                .withMessage('Payment Account Name must be 1-300 characters only'),
        body('accountNumber')
            .if(body('type').equals('Cheque')) // if type is Cheque
            .notEmpty() // then accountNumber is also required
            .isLength({ max: 300 }) // along with the rest of the validation
                .withMessage('Payment Account Number must be 1-300 characters only'),
        body('chequeNumber')
            .if(body('type').equals('Cheque')) // if type is Cheque
            .notEmpty() // then accountNumber is also required
            .isLength({ max: 300 }) // along with the rest of the validation
                .withMessage('Payment Cheque Number must be 1-300 characters only'),
   ]
}


module.exports = validate