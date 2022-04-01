const { body } = require('express-validator')

const validate = () => {
    return [
        body("productId")
            .isUUID().withMessage('Invalid ProductId'),
        body('supplier')
            .isLength({ min: 1, max: 300 }).withMessage('Name must be a 1-300 characters only'), 
        body('quantity')
            .isInt({ min: 1 })
                .withMessage('Quantity must be atleast 1'),
        body('unitPrice')
            .isFloat({ min: 1 })
                .withMessage('UnitPrice must be atleast 1'), 
        body('sellingPrice')
            .isFloat({ min: 1 })
                .withMessage('SellingPrice must be atleast 1'), 
   ]
}


module.exports = validate