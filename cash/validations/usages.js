const { body } = require('express-validator')

const validate = () => {
    return [
        body("cashId")
            .isUUID().withMessage('Invalid CashId'),
        body('amount')
            .isNumeric()
                .withMessage("Amount must be a digit"),
        body('purpose')
            .isLength({ min: 1, max: 300 }).withMessage('Description is too short')
            .matches("^[a-zA-Z0-9 ]+$", "i")
                .withMessage("Descrption must be atleast 1 characters, and can have Alphanumeric characters and spaces."),
   ]
}


module.exports = validate