const { body, param } = require('express-validator')

const validate = () => {
    return [
        param("id")
            .isUUID().withMessage('Invalid Id'),
   ]
}


module.exports = validate