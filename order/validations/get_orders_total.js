const { body, query } = require('express-validator')

const validate = () => {
    return [
        query('type')
            .isIn(['All', 'Day', 'Week', 'Month', 'Year'])
                .withMessage('type must be Day/Week/Month/Year'), 
        query('customerId')
            .optional()
            .isUUID().withMessage('Customer Id must be a uuid'),  
   ]
}


module.exports = validate