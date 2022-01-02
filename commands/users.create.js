const bcrypt = require('bcryptjs');
const userDAO = require('../user/user.dao');
const argv = process.argv.splice(2);

if (argv.length != 5) {
    console.log('missing arguments, try npm run users:create email@address.com password firstName lastName role');
    return process.exit();
}

const run = async ({ email, password, firstName, lastName, role }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const encryptedPass = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT));
            const newUser = await userDAO.insert(data = { 
                email, 
                password: encryptedPass, 
                firstName, 
                lastName,
                role, 
            });

            // console.log(newUser);
            resolve(newUser.id);
        } catch (error) {
            reject(error);
        }
    });
}

run({
    email: argv[0],
    password: argv[1],
    firstName: argv[2],
    lastName: argv[3],
    role: argv[4],
})
.then((id) => console.log(`User created ${id}`))
.catch((e) => console.log(`Error: ${e.toString()}`))
.finally(() => process.exit());


