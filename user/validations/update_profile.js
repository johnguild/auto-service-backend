const { body } = require('express-validator')

const validate = () => {
    return [
        body('email')
            .optional()
            .isEmail().withMessage('Email is invalid')
            .isLength({ min: 8, max: 64 }).withMessage('Email is too short'), 
        body('password')
            .optional({
                checkFalsy: true,
            })
            .isLength({ min: 8 }).withMessage('Password is too short')
            .matches("^[\\w#?!@$%^&*-_]+$", "i")
                .withMessage("Password must be atleast 8 characters, and can have the following Special Character #?!@$%^&*-_"),
        body('firstName')
            .isLength({ min: 1, max: 100 }).withMessage('First Name is too short')
            .matches("^[a-zA-Z0-9 ]+$", "i")
                .withMessage("First Name must be atleast 1 characters, and can have Alphanumeric characters and spaces."),
        body('lastName')
            .isLength({ min: 1, max: 100 }).withMessage('Last Name is too short')
            .matches("^[a-zA-Z0-9 ]+$", "i")
                .withMessage("Last Name must be atleast 1 characters, and can have Alphanumeric characters and spaces."),
        body('gender')
            .isIn(['Male', 'Female', 'Other'])
                .withMessage("gender must be one of the following Male/Female/Other"),
        body('mobile')
            .optional()
            .isNumeric()
                .withMessage("Mobile must be a digit"),
        body('birthDate')
            .optional()
            .isISO8601()
                .withMessage("BirthDate an ISO8601 format"),
   ]
}


module.exports = validate