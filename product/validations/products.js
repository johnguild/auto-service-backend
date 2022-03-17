const { body } = require('express-validator')

const validate = () => {
    return [
        body('name')
            .isLength({ min: 1, max: 300 }).withMessage('Name must be a 1-300 characters only'), 
        body('sku')
            .isLength({ min: 1, max: 300 }).withMessage('SKU must be a 1-300 characters only'), 
        body('description')
            .isLength({ min: 1, max: 3000 }).withMessage('Description must be a 1-3000 characters only'), 
        body('carMake')
            .optional()        
            .isLength({ min: 1, max: 300 }).withMessage('CarMake must be a 1-300 characters only'), 
        body('carType')
            .optional()        
            .isLength({ min: 1, max: 300 }).withMessage('CarType must be a 1-300 characters only'), 
        body('carYear')
            .optional()        
            .isLength({ min: 1, max: 300 }).withMessage('CarYear must be a 1-300 characters only'), 
        body('carPart')
            .optional()        
            .isLength({ min: 1, max: 300 }).withMessage('Car Part Number must be a 1-300 characters only'), 
   ]
}


module.exports = validate