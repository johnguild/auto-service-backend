const { body, param } = require('express-validator');

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
        body('comment')
            .isLength({ min: 1, max: 300 }).withMessage('Comment must be a 1-300 characters only'), 
   ]
}


module.exports = validate