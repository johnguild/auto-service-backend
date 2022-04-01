const { body, query } = require('express-validator')

const validate = () => {
    return [
        query('startDate')
            .isISO8601()
                .withMessage('Invalid Start Date'), 
        query('endDate')
            .isISO8601()
                .withMessage('Invalid End Date'), 
        query('customerId')
            .optional()
            .isUUID().withMessage('Customer Id must be a uuid'),  
        query('completed')
            .optional()
            .isBoolean().withMessage('completed must be a boolean'),  
   ]
}


module.exports = validate