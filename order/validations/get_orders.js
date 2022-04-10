const { body, query } = require('express-validator')

const validate = () => {
    return [
        query('completed')
            .optional()
            .isBoolean().withMessage('completed must be a boolean'),  
        query('customerId')
            .optional()
            .isUUID().withMessage('customerId must be a UUID format'),  
        query('page')
            .default(1)
            .isInt().withMessage('page must be an integer'),    
        query('limit')
            .default(10)
            .isInt().withMessage('limit must be an integer'),  
   ]
}


module.exports = validate