const jwt = require('jsonwebtoken');
const tokenator = require('../utils/tokenator');
const userDAO = require('../user/user.dao');

const auth = function(roles=[]) {
    return async function (req, res, next) {

        const fails = [
            'UNAUTHORIZED',// either access_key/secret_key is missing or unidentified keys
            'FORBIDDEN'// should be with correct keys but are not allowed to do the action
        ];

        try {

            // check if token is owned by any user
            const token = req.header('Authorization').replace('Bearer ', '');
            let decoded;
            // jwt.verify will manage different errors here (Expired, untrusted...)
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
       
            } catch (error) {
                // console.log('Error: invalid token');
                // console.log(error);
                throw new Error(fails[0]);
            }


            const users = await userDAO.find(
                where = { id: decoded.id }
            );

            if (users.length === 0) {
                throw new Error(fails[1]);
            }

            const loggedUser = users[0];


            if (loggedUser.isDisabled) {
                throw new Error(fails[0]);
            }

            if (roles.length > 0 && !roles.includes(loggedUser.role)) {
                throw new Error(fails[1]);
            }


            /// generate new token, 
            /// if the current token is only valid 
            /// for less than 30 minutes
            let msDifference =  new Date(decoded.exp * 1000) - new Date();
            let minutes = Math.floor(msDifference/1000/60);
            
            // console.log(minutes);
            // console.log(new Date(decoded.exp * 1000).toLocaleString());
            // console.log(token);

            req.api.token(minutes < 30 
                ?   tokenator.generate({
                        userId: loggedUser.id,
                    })
                : token
            );

            req.user = loggedUser;
            next()
        } catch (e) {
            // console.log(e);

            let status, message;
            switch(e.message) {
                case fails[1]:
                    status = 403;
                    message = 'Forbidden Action';
                break;
                case fails[0]:
                default:
                    status = 401;
                    message = 'Unauthorized Action.';
                break;
            }


            req.api.status(status).errors([ message ]).send();
   
        }
    }
}

module.exports = auth