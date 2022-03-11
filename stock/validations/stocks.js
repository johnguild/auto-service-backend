const { body } = require('express-validator')

const validate = () => {
    return [
        body("productId")
            .isUUID().withMessage('Invalid ProductId'),
        body('supplier')
            .isLength({ min: 1, max: 300 }).withMessage('Name must be a 1-300 characters only'), 
        body('quantity')
            .isInt()
                .withMessage('Quantity must be an Int')
            .isLength({ min: 1 }).withMessage('quantity minimum is 1'), 
        body('unitPrice')
            .isNumeric()
                .withMessage('UnitPrice must be a number'), 
        body('sellingPrice')
            .isNumeric()
                .withMessage('SellingPrice must be a number'), 
   ]
}


module.exports = validate