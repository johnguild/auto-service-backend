const { body, query } = require('express-validator')

const validate = () => {
    return [
        query('withStocks')
            .optional()
            .isBoolean().withMessage('withStock must be a boolean'),  
        query('keyword')
            .default('')
            .isString().withMessage('keyword must be string'),   
        query('limit')
            .default(30)
            .isInt().withMessage('limit must be an integer'),  
   ]
}


module.exports = validate