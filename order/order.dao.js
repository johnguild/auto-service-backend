const { getPool } = require('../db/postgres');
const pool = getPool();
const { toSnakeCase } = require('../utils/string');

const User = require('../user/user.model');
const Service = require('../service/service.model');
const Product = require('../product/product.model');
const Mechanic = require('../mechanic/mechanic.model');
const Order = require('./order.model');
const OrderServices = require('./orderServices.model');
const OrderProducts = require('./orderProducts.model');
const OrderPayments = require('./orderPayments.model');
const OrderMechanics = require('./orderMechanics.model');


/**
 * Insert a new instance of Order
 * 
 * @param {*} data 
 * @returns {Order} Order?
 */
const insertOrder = async(
    data = { 
        customerId, 
        total, 
        carMake,
        carType,
        carYear,
        carPlate,
        carOdometer,
        receiveDate,
        warrantEnd,
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
        serviceId,
        productId, 
        price, 
        quantity,
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
        type,
        bank,
        referenceNumber,
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

/**
 * Insert a new instance of OrderMechanics
 * 
 * @param {*} data 
 * @returns {OrderMechanics} OrderMechanics?
 */
 const insertOrderMechanic = async(
    data = {
        orderId, 
        mechanicId,
    }
) => {

    let text = `INSERT INTO ${OrderMechanics.tableName} `;

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

    return res.rows.length > 0 ? OrderMechanics.fromDB(res.rows[0]) : null;
}

const updateOrder = async(
    data = {
        completed,
    }, 
    where = {
        id,
    }
) => {
    /// collect all variables need to build the query
    const columns = [], wColumns = [], values = [], valueIndexes = [];
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

    for (const attr in where) {
        if (where[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            wColumns.push(snakedAttr);
            values.push(where[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    let valuIndexPos = 0;
    let updateString = ' ';
    columns.forEach((col, ind) => {
        updateString += ` ${col} = ${valueIndexes[ind]} ,`;
        valuIndexPos = ind;
    });

    if(updateString.charAt(updateString.length-1) == ',') {
        updateString = updateString.slice(0, -1);
    }

    let whereString = ' ';
    wColumns.forEach((col, ind) => {
        let prefix = ind > 0 ? 'AND ' : ''; 
        whereString += `${prefix}${col} = ${valueIndexes[valuIndexPos + ind + 1]} `;
    });
     
    const text = `
        UPDATE ${Order.tableName} 
        SET ${updateString} 
        WHERE ${whereString}
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Order.fromDB(u)) : [];
}

const find = async(
    where= {
        customerId,
        completed,
    },
    opt= {
        limit: undefined,
        skip: undefined,
        startDate: undefined,
        endDate: undefined,
    }
) => {

    /// collect all variables need to build the query
    const columns = [], values = [], valueIndexes = [];
    let i = 1;
    for (const attr in where) {
        if (where[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(where[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    let whereString = ' ';
    columns.forEach((col, ind) => {
        let prefix = ind > 0 ? 'AND ' : ''; 
        whereString += `${prefix}o.${col} = ${valueIndexes[ind]} `;
    });

    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }

    let optionString = ' ';
    if (opt != undefined) {
        if (opt.limit) {
            optionString += `LIMIT ${opt.limit} `;
        }

        if (opt.skip != undefined) {
            optionString += `OFFSET ${opt.skip} `;
        }

        if (opt.startDate != undefined && opt.endDate != undefined) {
            if (whereString.trim() == '') {
                whereString = `WHERE o.created_at >= '${opt.startDate}' 
                    AND o.created_at <= '${opt.endDate}'`;
            } else {
                whereString += `AND o.created_at >= '${opt.startDate}' 
                    AND o.created_at <= '${opt.endDate}'`;
            }
        }
    }
     
    let text = `
        SELECT o.*, (SELECT json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 
                'email', u.email, 'mobile', u.mobile) as customer 
                FROM ${User.tableName} as u 
                WHERE u.id = o.customer_id 
            ) as customer, 
            CASE WHEN count(ss) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT ss.srv) END as all_services,
            CASE WHEN count(pr) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT pr.prdct) END as all_products,
            CASE WHEN count(py) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT py.pymnt) END as all_payments,
            CASE WHEN count(me) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT me.mechanic) END as all_mechanics  
        FROM ${Order.tableName} as o 
        LEFT OUTER JOIN (
            SELECT s.order_id, jsonb_build_object('service_id', s.service_id, 'title', 
                (SELECT ss.title FROM ${Service.tableName} as ss WHERE ss.id = s.service_id ),
                'price', s.price) as srv  
            FROM ${OrderServices.tableName} as s 
        ) as ss ON ss.order_id = o.id 
        LEFT OUTER JOIN (
            SELECT p.order_id, jsonb_build_object('price', p.price, 'service_id', p.service_id, 
                'product_id', p.product_id, 'quantity', p.quantity, 
                'name', (SELECT pp.name FROM ${Product.tableName} as pp WHERE pp.id = p.product_id )
                ) as prdct  
            FROM ${OrderProducts.tableName} as p 
        ) as pr ON pr.order_id = o.id 
        LEFT OUTER JOIN (
            SELECT p.order_id, jsonb_build_object('id', p.id, 'amount', p.amount, 
                'type', p.type, 'bank', p.bank, 'reference_number', p.reference_number,
                'date_time', p.date_time) as pymnt  
            FROM ${OrderPayments.tableName} as p 
        ) as py ON py.order_id = o.id 
        LEFT OUTER JOIN (
            SELECT m.order_id, jsonb_build_object('id', m.id, 'mechanic_id', m.mechanic_id, 
                'full_name', (SELECT CONCAT(mm.first_name, ' ', mm.last_name) FROM ${Mechanic.tableName} as mm WHERE mm.id = m.mechanic_id ) 
                ) as mechanic   
            FROM ${OrderMechanics.tableName} as m 
        ) as me ON me.order_id = o.id  
        ${whereString} `;
    text += 'GROUP BY o.id ';
    text += 'ORDER BY o.completed ASC ';
    text += `${optionString} ;`;

        
    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    // console.dir(res.rows, {depth: null});

    return res.rows.length > 0 ? 
        res.rows.map(u => Order.fromDB(u)) : [];
}

const findCount = async(
    where = {
        customerId,
        completed,
    }
) => {

    /// collect all variables need to build the query
    const columns = [], values = [], valueIndexes = [];
    let i = 1;
    for (const attr in where) {
        if (where[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(where[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    let whereString = ' ';
    columns.forEach((col, ind) => {
        let prefix = ind > 0 ? 'AND ' : ''; 
        whereString += `o.${prefix}${col} = ${valueIndexes[ind]} `;
    });

    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }
     
    let text = `
        SELECT COUNT(*) as total 
        FROM ${Order.tableName} as o 
        ${whereString};`;

        
    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    // console.dir(res.rows, {depth: null});

    return res.rows.length > 0 ? res.rows[0].total : 0;
}

const total = async(
    where = {
        customerId,
        completed,
    },
    opt = {
        startDate,
        endDate,
    } 
) => {

    if (!opt.startDate && !opt.endDate) {
        throw Error('Required to add opt.startDate and opt.endDate');
    }

    /// collect all variables need to build the query
    const columns = [], values = [], valueIndexes = [];
    let i = 1;
    for (const attr in where) {
        if (where[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(where[attr]);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    let whereString = ' ';
    columns.forEach((col, ind) => {
        let prefix = ind > 0 ? 'AND ' : ''; 
        whereString += `o.${prefix}${col} = ${valueIndexes[ind]} `;
    });

    /// appends the date range
    if (whereString.trim() != '') {
        whereString += 'AND ';
    }
    whereString += `o.created_at >= '${opt.startDate}' 
        AND o.created_at <= '${opt.endDate}' `;

    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }

    let text = `
        SELECT SUM(o.total) as total 
        FROM ${Order.tableName} as o 
        ${whereString};`;

        
    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    // console.dir(res.rows, {depth: null});

    return res.rows.length > 0 && res.rows[0].total ? res.rows[0].total : 0;
}

const findMechanicsWithOngoing = async() => {
    
    let text = `
        SELECT m.*, oo.car_plate   
        FROM ${Mechanic.tableName} as m 
        LEFT JOIN (
            SELECT om.mechanic_id, om.order_id  
            FROM ${OrderMechanics.tableName} as om 
        ) as om ON om.mechanic_id = m.id 
        LEFT JOIN (
            SELECT o.id, o.car_plate   
            FROM ${Order.tableName} as o 
        ) as oo ON oo.id = om.order_id 
        GROUP BY m.id, oo.car_plate 
    `;
    // text += `GROUP BY oo.car_plate, m.id;`;
        
    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text });

    // console.dir(res.rows, {depth: null});
    /// format data
    const formattedData = [];
    // console.dir(formattedData, {depth: null});
    res.rows.forEach((ri) => {
        let onFormatted = null;
        formattedData.forEach((fi) => {
            if (ri.id == fi.id) {
                onFormatted = fi;
            }
        });

        if (onFormatted) {
            onFormatted.car_plates.push(ri.car_plate);
        } else {
            formattedData.push({
                ...ri,
                car_plates: [ri.car_plate],
            })
        }
    })
    // console.dir(formattedData, {depth: null});

    return formattedData.map(u => Mechanic.fromDB(u));
}

module.exports = {
    insertOrder,
    insertOrderService,
    insertOrderProduct,
    insertOrderPayment,
    insertOrderMechanic,
    updateOrder,
    find,
    findCount,
    total,
    findMechanicsWithOngoing
}