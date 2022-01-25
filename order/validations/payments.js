const { body, param } = require('express-validator')

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('amount')
            .isNumeric().withMessage('Amount must be a number'),
   ]
}


module.exports = validate