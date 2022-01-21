const { getPool } = require('../db/postgres');
const pool = getPool();
const { toSnakeCase } = require('../utils/string');

const Order = require('./order.model');
const OrderServices = require('./orderServices.model');
const OrderProducts = require('./orderProducts.model');
const OrderPayments = require('./orderPayments.model');



/**
 * Insert a new instance of Order
 * 
 * @param {*} data 
 * @returns {Order} Order?
 */
const insertOrder = async(
    data = { 
        customerId, 
        installments,
        total, 
    }
) => {

    let text = `INSERT INTO ${Order.tableName} `;

    const columns = [], values = [], valueIndexes = [];
    /// collect all variables need to build the query
    let i = 1;
    for (const attr in data) {
        if (data[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(data[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    // end text
    text += `(${columns.toString()}) 
        VALUES (${valueIndexes.toString()}) 
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? Order.fromDB(res.rows[0]) : null;
}



/**
 * Insert a new instance of OrderServices
 * 
 * @param {*} data 
 * @returns {OrderServices} OrderServices?
 */
 const insertOrderService = async(
    data = {
        orderId, 
        serviceId, 
        price, 
    }
) => {

    let text = `INSERT INTO ${OrderServices.tableName} `;

    const columns = [], values = [], valueIndexes = [];
    /// collect all variables need to build the query
    let i = 1;
    for (const attr in data) {
        if (data[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(data[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    // end text
    text += `(${columns.toString()}) 
        VALUES (${valueIndexes.toString()}) 
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? OrderServices.fromDB(res.rows[0]) : null;
}


/**
 * Insert a new instance of OrderProducts
 * 
 * @param {*} data 
 * @returns {OrderProducts} OrderProducts?
 */
 const insertOrderProduct = async(
    data = {
        orderId, 
        productId, 
        price, 
    }
) => {

    let text = `INSERT INTO ${OrderProducts.tableName} `;

    const columns = [], values = [], valueIndexes = [];
    /// collect all variables need to build the query
    let i = 1;
    for (const attr in data) {
        if (data[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(data[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    // end text
    text += `(${columns.toString()}) 
        VALUES (${valueIndexes.toString()}) 
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? OrderProducts.fromDB(res.rows[0]) : null;
}


/**
 * Insert a new instance of OrderPayments
 * 
 * @param {*} data 
 * @returns {OrderPayments} OrderPayments?
 */
 const insertOrderPayment = async(
    data = {
        orderId, 
        amount, 
        dateTime, 
    }
) => {

    let text = `INSERT INTO ${OrderPayments.tableName} `;

    const columns = [], values = [], valueIndexes = [];
    /// collect all variables need to build the query
    let i = 1;
    for (const attr in data) {
        if (data[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(data[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    // end text
    text += `(${columns.toString()}) 
        VALUES (${valueIndexes.toString()}) 
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? OrderPayments.fromDB(res.rows[0]) : null;
}

module.exports = {
    insertOrder,
    insertOrderService,
    insertOrderProduct,
    insertOrderPayment,
    // update,
    // find,
    // findCount
}