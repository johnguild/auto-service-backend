const { body, query } = require('express-validator')

const validate = () => {
    return [
        query('productId')
            .optional()
            .isUUID().withMessage('invalid productId'),  
        query('page')
            .default(1)
            .isInt().withMessage('page must be an integer'),    
        query('limit')
            .default(10)
            .isInt().withMessage('limit must be an integer'),  
   ]
}


module.exports = validate