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
        body('active')
            .optional()
            .isBoolean()
                .withMessage("Active must be a boolean"),
        body('companyName')
            .optional()
            .isLength({ min: 1, max: 300 }).withMessage('Company Name must be a 1-300 characters only'),
        body('companyNumber')
            .if(body('companyName').exists()) // if companyName provided
            .not().isEmpty() // then companyNumber is also required
            .isNumeric().withMessage('Company Number must be a number'),
        body('companyAddress')
            .if(body('companyName').exists()) // if companyName provided
            .not().isEmpty() // then companyAddress is also required
            .isLength({ min: 1, max: 500 }).withMessage('Company Address must be a 1-500 characters only'),
        body('companyTin')
            .if(body('companyName').exists()) // if companyName provided
            .not().isEmpty() // then companyTin is also required
            .isLength({ min: 1, max: 300 }).withMessage('Company TIN must be a 1-300 characters only'),
   ]
}


module.exports = validate