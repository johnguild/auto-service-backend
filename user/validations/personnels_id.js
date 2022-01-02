const { body, param } = require('express-validator');

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('email')
            .isEmail().withMessage('Email is invalid')
            .isLength({ min: 8, max: 64 }).withMessage('Email is too short'), 
        body('firstName')
            .optional()
            .isLength({ min: 1, max: 100 }).withMessage('First Name is too short')
            .matches("^[a-zA-Z0-9 ]+$", "i")
                .withMessage("First Name must be atleast 1 characters, and can have Alphanumeric characters and spaces."),
        body('lastName')
            .optional()
            .isLength({ min: 1, max: 100 }).withMessage('Last Name is too short')
            .matches("^[a-zA-Z0-9 ]+$", "i")
                .withMessage("Last Name must be atleast 1 characters, and can have Alphanumeric characters and spaces."),
        body('gender')
            .optional()
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