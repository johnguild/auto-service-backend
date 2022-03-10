const { body } = require('express-validator')

const validate = () => {
    return [
        body('amount')
            .isNumeric()
                .withMessage("Amount must be a digit"),
   ]
}


module.exports = validate