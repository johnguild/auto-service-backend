const { body } = require('express-validator')

const validate = () => {
    return [
        body('email')
            .isEmail().withMessage('Email is invalid')
            .isLength({ min: 8, max: 64 }).withMessage('Email is too short'), 
        body('password')  
            .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 character') 
            .matches("^[\\w#?!@$%^&*-_]+$", "i")
                .withMessage("Password must be atleast 8 characters, and can have the following Special Characters #?!@$%^&*-_")
   ]
}


module.exports = validate