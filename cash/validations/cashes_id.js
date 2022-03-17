const { body, param } = require('express-validator');

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('amount')
            .isNumeric()
                .withMessage("Amount must be a digit"),
        body('purpose')
            .isLength({ min: 1, max: 300 }).withMessage('Purpose is too short')
            .matches("^[a-zA-Z0-9 ]+$", "i")
                .withMessage("Purpose must be atleast 1 characters, and can have Alphanumeric characters and spaces."),
   ]
}


module.exports = validate