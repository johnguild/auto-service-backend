const { body, query } = require('express-validator');
const Product = require('../product.model');

const validate = () => {
    return [
        query('keyword')
            .default('')
            .isString().withMessage('keyword must be string'),  
        query('supplierKeyword')
            .default('')
            .isString().withMessage('keyword must be string'),  
        query('withStocks')
            .optional()
            .isBoolean().withMessage('withStock must be a boolean'),  
        query('orderBy')
            .optional()
            .isIn([
                Product.ORDER_BY_NAME_ASC, 
                Product.ORDER_BY_NAME_DESC,
                Product.ORDER_BY_DESCRIPTION_ASC,
                Product.ORDER_BY_DESCRIPTION_DESC,
            ])
            .withMessage(`orderBy must be either ${Product.ORDER_BY_NAME_ASC}, ${Product.ORDER_BY_NAME_DESC}, ${Product.ORDER_BY_DESCRIPTION_ASC}, or ${Product.ORDER_BY_DESCRIPTION_DESC}`),
        query('page')
            .default(1)
            .isInt().withMessage('page must be an integer'),    
        query('limit')
            .default(10)
            .isInt().withMessage('limit must be an integer'),  
   ]
}


module.exports = validate