const { body, param } = require('express-validator')

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('type')
            .isIn(['AccountsReceivable', 'Online', 'Cash'])
                .withMessage('type must be a either of AccountsReceivable/Online/Cash'),
        body('amount')
            .isNumeric().withMessage('Amount must be a number'),
        body('bank')
            .optional()
            .isLength({ max: 300 }).withMessage('Bank/E-Wallet must be 1-300 characters only'),
        body('referenceNumber')
            .optional()
            .isLength({ max: 300 }).withMessage('Reference Number must be 1-300 characters only'),
   ]
}


module.exports = validate