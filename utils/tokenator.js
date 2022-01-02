const jwt = require('jsonwebtoken');

const generate = ({
    userId,
    expiry = '24h', // 3 hours default
}) => {
    return jwt.sign({ 
        id: userId.toString(),
    }, process.env.JWT_SECRET,
    { expiresIn: expiry });
}


module.exports = {
    generate,
}