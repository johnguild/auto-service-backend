const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;

let pool;


const getPool = () => {
    if (!pool) {
        pool = connectionString ? new Pool({ 
            connectionString,
            ssl: {
              rejectUnauthorized: false
            } 
        }) : new Pool();

        // the pool will emit an error on behalf of any idle clients
        // it contains if a backend error or network partition happens
        pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err)
            process.exit(-1)
        });

        pool.on('connect', (err, client) => {
            if (!err) {
                console.log('Connected to database');
            }
        });
    }
    return pool;
}

const closePool = async  () => {
    if (pool) await pool.end();
}


module.exports = {
    getPool,
    closePool
}