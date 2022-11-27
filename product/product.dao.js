const { getPool } = require('../db/postgres');
const pool = getPool();

const { toSnakeCase } = require('../utils/string');
const Product = require('./product.model');
const Stock = require('../stock/stock.model');
const ProductArchive = require('./product_archive.model');
const User = require('../user/user.model');


const appendText = (condition, preText, text) => {
    // console.log(condition, text);
    return condition ? `${text} ${preText} ` : text; 
}


/**
 * Insert a new instance of Product
 * 
 * @param {*} data 
 * @returns {Product} Product?
 */
const insert = async(
    data = {
        name,
        description,
        carMake,
        carType,
        carYear,
        carPart,
    }
) => {

    let text = `INSERT INTO ${Product.tableName} `;

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

    return res.rows.length > 0 ? Product.fromDB(res.rows[0]) : null;
}

/**
 * Updates an instance of Product
 * 
 * @param {*} data 
 * @param {*} where 
 * @returns {Product} Array of Product
 */
const update = async(
    data = {        
        name,
        description,
        carMake,
        carType,
        carYear,
        carPart,
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
        UPDATE ${Product.tableName} 
        SET ${updateString} 
        WHERE ${whereString}
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Product.fromDB(u)) : [];
}


const find = async(
    where = {
        id,    
        name,
        description,
        carMake,
        carType,
        carYear,
        carPart,
    },
    options = {
        limit: undefined,
        skip: undefined,
        like: undefined,
        likeSupplier: undefined, 
        withStocks: undefined,
        withOutStocks: undefined, 
        orderByColumn: undefined,
        orderByRule: undefined,
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
        whereString += `${prefix}p.${col} = ${valueIndexes[ind]} `;
    });


    if (options.like !== undefined) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        whereString += `(
            p.name ILIKE $${values.length + 1} OR 
            p.description ILIKE $${values.length + 1} OR 
            p.car_make ILIKE $${values.length + 1} OR 
            p.car_type ILIKE $${values.length + 1} OR 
            p.car_year ILIKE $${values.length + 1} OR 
            p.car_part ILIKE $${values.length + 1}
        )
        `;
        values.push(`%${options.like}%`);
    }


    if (options.likeSupplier !== undefined) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        /// add where to by stock supplier
        whereString += `EXISTS (
            SELECT 1 FROM ${Stock.tableName} as s 
                WHERE s.product_id = p.id
                    AND s.supplier ILIKE $${values.length + 1} 
                    AND s.quantity > 0 
        )
        `;


        values.push(`%${options.likeSupplier}%`);
    }



    if (options.withStocks !== undefined) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        /// add where to by stock supplier
        whereString += `EXISTS (
            SELECT 1 FROM ${Stock.tableName} as s 
                WHERE s.product_id = p.id
                    AND s.quantity > 0 
        )
        `;
    }


    if (options.withOutStocks !== undefined) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        /// add where to by stock supplier
        whereString += `NOT EXISTS (
            SELECT 1 FROM ${Stock.tableName} as s 
                WHERE s.product_id = p.id
                    AND s.quantity > 0 
        )
        `;
    }


    /// add condition where there is no approved archive request
    whereString = appendText(whereString.trim() != '', 'AND', whereString);
    whereString += `NOT EXISTS (
        SELECT 1 FROM ${ProductArchive.tableName} as pa  
            WHERE pa.product_id = p.id
                AND pa.approved_at IS NOT NULL  
    )`;


    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }


    let optionString = ' ';
    if (options != undefined) {

        if (options.orderByColumn && options.orderByRule) {
            optionString += ` ORDER BY ${options.orderByColumn} ${options.orderByRule} `;
        }
    
        if (options.limit) {
            optionString += `LIMIT ${options.limit} `;
        }

        if (options.skip) {
            optionString += `OFFSET ${options.skip} `;
        }
    }
     
    const text = `
        SELECT p.*, 
            CASE WHEN count(ss) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT ss.stock) END as stocks, 
            CASE WHEN count(aa) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT aa.archive) END as archives   
        FROM ${Product.tableName} as p 
        LEFT OUTER JOIN (
            SELECT s.product_id, jsonb_build_object('id', s.id, 'quantity', s.quantity, 
                'supplier', s.supplier, 'unit_price', s.unit_price, 'selling_price', s.selling_price) 
                as stock  
            FROM ${Stock.tableName} as s 
            WHERE s.quantity > 0  
        ) as ss ON ss.product_id = p.id 
        LEFT OUTER JOIN (
            SELECT pa.product_id, jsonb_build_object('id', pa.id, 'requested_comment', pa.requested_comment, 'requested_at', pa.requested_at) as archive  
            FROM ${ProductArchive.tableName} as pa  
            WHERE pa.approved_by IS NULL 
                AND pa.declined_by IS NULL 
        ) as aa ON aa.product_id = p.id 
        ${whereString} 
        GROUP BY p.id  
        ${optionString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Product.fromDB(u)) : [];

}


const findLike = async(
    where = { 
        name,
        description,
        carMake,
        carType,
        carYear,
        carPart,
    },
    options = {
        limit: undefined,
        skip: undefined,
    }
) => {

    /// collect all variables need to build the query
    const columns = [], values = [], valueIndexes = [];
    let i = 1;
    for (const attr in where) {
        if (where[attr] !== undefined) {
            const snakedAttr = attr.toString().toSnakeCase();
            columns.push(snakedAttr);
            values.push(`%${where[attr]}%`);
            valueIndexes.push(`$${i}`);
            i++;
        }
    }

    let whereString = ' ';
    columns.forEach((col, ind) => {
        let prefix = ind > 0 ? 'OR ' : '('; 
        whereString += `${prefix}p.${col} ILIKE ${valueIndexes[ind]} `;
    });
    whereString = appendText(whereString.trim() != '', ')', whereString);

    /// add condition where there is no approved archive request
    whereString = appendText(whereString.trim() != '', 'AND', whereString);
    whereString += `NOT EXISTS (
        SELECT 1 FROM ${ProductArchive.tableName} as pa  
            WHERE pa.product_id = p.id
                AND pa.approved_at IS NOT NULL 
    )`;

    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }

    let optionString = ' ';
    if (options != undefined) {
        if (options.limit) {
            optionString += `LIMIT ${options.limit} `;
        }

        if (options.skip) {
            optionString += `OFFSET ${options.skip} `;
        }
    }
     
    const text = `
        SELECT p.*,
            CASE WHEN count(ss) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT ss.stock) END as stocks, 
            CASE WHEN count(aa) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT aa.archive) END as archives  
        FROM ${Product.tableName} as p 
        LEFT OUTER JOIN (
            SELECT s.product_id, jsonb_build_object('id', s.id, 'quantity', s.quantity, 
                'supplier', s.supplier, 'unit_price', s.unit_price, 'selling_price', s.selling_price) 
                as stock  
            FROM ${Stock.tableName} as s 
            WHERE s.quantity > 0  
        ) as ss ON ss.product_id = p.id 
        LEFT OUTER JOIN (
            SELECT pa.product_id, jsonb_build_object('id', pa.id, 'requested_comment', pa.requested_comment) as archive  
            FROM ${ProductArchive.tableName} as pa  
            WHERE pa.approved_by IS NULL 
                AND pa.declined_by IS NULL 
        ) as aa ON aa.product_id = p.id 
        ${whereString} 
        GROUP BY p.id  
        ${optionString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => Product.fromDB(u)) : [];

}

const findCount = async(
    where = {
        id,    
        name,
        description,
        carMake,
        carType,
        carYear,
        carPart,
    },
    options = {
        like: undefined,
        likeSupplier: undefined, 
        withStocks: undefined,
        withOutStocks: undefined, 
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
        whereString += `${prefix}p.${col} = ${valueIndexes[ind]} `;
    });


    if (options.like) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        whereString += `  
            (p.name ILIKE $${values.length + 1} OR 
             p.description ILIKE $${values.length + 1} OR 
             p.car_make ILIKE $${values.length + 1} OR 
             p.car_type ILIKE $${values.length + 1} OR 
             p.car_year ILIKE $${values.length + 1} OR 
             p.car_part ILIKE $${values.length + 1})
        `;
        values.push(`%${options.like}%`);
    }

    if (options.likeSupplier !== undefined) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        /// add where to by stock supplier
        whereString += ` EXISTS (
            SELECT 1 FROM ${Stock.tableName} as s 
                WHERE s.product_id = p.id 
                    AND s.supplier ILIKE $${values.length + 1} 
                    AND s.quantity > 0 
        )
        `;

        values.push(`%${options.likeSupplier}%`);
    }

    if (options.withStocks !== undefined) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        /// add where to by stock supplier
        whereString += `EXISTS (
            SELECT 1 FROM ${Stock.tableName} as s 
                WHERE s.product_id = p.id
                    AND s.quantity > 0 
        )
        `;
    }

    if (options.withOutStocks !== undefined) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        /// add where to by stock supplier
        whereString += `NOT EXISTS (
            SELECT 1 FROM ${Stock.tableName} as s 
                WHERE s.product_id = p.id
                    AND s.quantity > 0 
        )
        `;
    }

    /// add condition where there is no approved archive request
    whereString = appendText(whereString.trim() != '', 'AND', whereString);
    whereString += `NOT EXISTS (
        SELECT 1 FROM ${ProductArchive.tableName} as pa  
            WHERE pa.product_id = p.id
                AND pa.approved_by IS NOT NULL 
    )`;

    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }

    const text = `
        SELECT COUNT(*) as total 
        FROM ${Product.tableName} as p 
        ${whereString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? res.rows[0].total : 0;

}

/**
 * Insert a new instance of ProductArchive
 * 
 * @param {*} data 
 * @returns {ProductArchive} ProductArchive?
 */
 const insertArchive = async(
    data = {
        productId,
        requestedBy,
        requestedCommet,
    }
) => {

    let text = `INSERT INTO ${ProductArchive.tableName} `;

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

    return res.rows.length > 0 ? ProductArchive.fromDB(res.rows[0]) : null;
}


/**
 * Updates an instance of ProductArchive
 * 
 * @param {*} data 
 * @param {*} where 
 * @returns {ProductArchive} Array of ProductArchive
 */
 const updateArchive = async(
    data = {        
        requestedCommet,
        declinedBy,
        declinedAt,
        approvedBy,
        approvedAt,
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
        UPDATE ${ProductArchive.tableName} 
        SET ${updateString} 
        WHERE ${whereString}
        RETURNING *;`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? 
        res.rows.map(u => ProductArchive.fromDB(u)) : [];
}


const findArchive = async(
    where = {
        id,  
        requestedBy,
    },
    options = {
        limit: undefined,
        skip: undefined,
        isPending: undefined,
        isApproved: undefined,
        isDeclined: undefined, 
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
        whereString += `${prefix}p.${col} = ${valueIndexes[ind]} `;
    });


    if (options && options.isPending) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        whereString += `p.approved_by IS NULL AND p.declined_by IS NULL `;
    }

    if (options && options.isApproved) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        whereString += `p.approved_by IS NOT NULL `;
    }

    if (options && options.isDeclined) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        whereString += `p.declined_by IS NOT NULL `;
    }


    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }

    let optionString = ' ';
    if (options != undefined) {


        if (options.limit) {
            optionString += `LIMIT ${options.limit} `;
        }

        if (options.skip) {
            optionString += `OFFSET ${options.skip} `;
        }
    }
     
    const text = `
        SELECT p.*,  
            CASE WHEN count(pp) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT pp.product) END as products, 
            CASE WHEN count(ru) = 0 THEN ARRAY[]::jsonb[] ELSE array_agg(DISTINCT ru.requestor) END as requestors    
        FROM ${ProductArchive.tableName} as p 
        LEFT OUTER JOIN (
            SELECT pro.id, jsonb_build_object('id', pro.id, 
            'name', pro.name, 
            'description', pro.description, 
            'car_make', pro.car_make, 
            'car_type', pro.car_type,
            'car_year', pro.car_year,
            'car_part', pro.car_part) as product  
            FROM ${Product.tableName} as pro  
        ) as pp ON pp.id = p.product_id 
        LEFT OUTER JOIN (
            SELECT u.id, jsonb_build_object('id', u.id, 
            'first_name', u.first_name, 
            'last_name', u.last_name) as requestor  
            FROM ${User.tableName} as u   
        ) as ru ON ru.id = p.requested_by  
        ${whereString} 
        GROUP BY p.id  
        ORDER BY requested_at DESC
        ${optionString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    // console.dir(res.rows, {depth:null});

    return res.rows.length > 0 ? 
        res.rows.map(u => ProductArchive.fromDB(u)) : [];
}

const findCountArchive = async(
    where = {
        id,  
        requestedBy,
    },
    options = {
        isPending: undefined,
        isApproved: undefined,
        isDeclined: undefined, 
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
        whereString += `${prefix}p.${col} = ${valueIndexes[ind]} `;
    });

    if (options && options.isPending) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        whereString += `p.approved_by IS NULL AND p.declined_by IS NULL `;
    }

    if (options && options.isApproved) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        whereString += `p.approved_by IS NOT NULL `;
    }

    if (options && options.isDeclined) {
        whereString = appendText(whereString.trim() != '', 'AND', whereString);
        whereString += `p.declined_by IS NOT NULL `;
    }

    if (whereString.trim() != '') {
        whereString = `WHERE ${whereString}`;
    }


    const text = `
        SELECT COUNT(id) as total  
        FROM ${ProductArchive.tableName} as p 
        ${whereString};`;

    // console.log(text);
    // console.log(values);
    const res = await pool.query({ text, values });

    return res.rows.length > 0 ? res.rows[0].total : 0;
}


module.exports = {
    insert,
    update,
    find,
    findLike,
    findCount,
    insertArchive,
    updateArchive, 
    findArchive, 
    findCountArchive, 
}