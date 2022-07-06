const { body, query } = require('express-validator')

const validate = () => {
    return [
        query('mechanics')
            .default([])
            .isArray().withMessage('Mechanics must be an array'),
        query('mechanics.*')
            .isUUID().withMessage('Mechanics must be an array of id'),
        query('startDate')
            .isISO8601()
                .withMessage('Invalid Start Date'), 
        query('endDate')
            .isISO8601()
                .withMessage('Invalid End Date'), 
        query('completed')
            .optional()
            .isBoolean().withMessage('completed must be a boolean'),  
   ]
}


module.exports = validate