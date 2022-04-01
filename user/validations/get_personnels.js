const { body, query } = require('express-validator')

const validate = () => {
    return [
        query('keyword')
            .default('')
            .isString().withMessage('keyword must be string'),  
        query('page')
            .default(1)
            .isInt().withMessage('page must be an integer'),    
        query('limit')
            .default(10)
            .isInt().withMessage('limit must be an integer'),  
   ]
}


module.exports = validate