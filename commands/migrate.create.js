const appRoot = require('app-root-path');
const path = require('path');
const fs = require('fs');
const argv = process.argv.splice(2);
const migrationController = require('../migration/migration.controller'); 

if (argv.length != 1) {
    console.log('missing arguments, try npm run create:migration create_users_table');
    return process.exit();
}


const createMigration = async (label) => {
    
    const jsName = await migrationController.create(label);

    return jsName;

}

createMigration(argv[0])
.then((fileName) => console.log(`Success! ${fileName} created`))
.catch((e) => console.log(e.toString()))
.finally(() => process.exit());
