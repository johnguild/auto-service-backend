const { body } = require('express-validator')

const validate = () => {
    return [
        body('email')
            .isEmail().withMessage('Email is invalid')
            .isLength({ min: 8, max: 64 }).withMessage('Email is too short'), 
        body('password')
            .matches("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$", "i")
                .withMessage("Password must be atleast 8 characters, have atleast 1 Uppercase, 1 Lowercase, 1 Digit, 1 Special Character")
   ]
}


module.exports = validate