const { body, param } = require('express-validator');

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('amount')
            .isNumeric()
                .withMessage("Amount must be a digit"),
   ]
}


module.exports = validate