const { body } = require('express-validator')

const validate = () => {
    return [
        body('currentPassword')
            .isLength({ min: 8 }).withMessage('Current Password is too short')
            .matches("^[\\w#?!@$%^&*-_]+$", "i")
                .withMessage("Current Password must be atleast 8 characters, and can have the following Special Character #?!@$%^&*-_"),
        body('password')
            .isLength({ min: 8 }).withMessage('Password is too short')
            .matches("^[\\w#?!@$%^&*-_]+$", "i")
                .withMessage("Password must be atleast 8 characters, and can have the following Special Character #?!@$%^&*-_"),
            
   ]
}


module.exports = validate