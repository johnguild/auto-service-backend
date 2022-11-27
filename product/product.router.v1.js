const express = require('express');
const bcrypt = require('bcryptjs');
const tokenator = require('../utils/tokenator');
const api = require('../middlewares/api');
const auth = require('../middlewares/auth');
const productsValidation = require('./validations/products');
const productsIdValidation = require('./validations/products_id');
const archivessValidation = require('./validations/archives');
const archivesApproveValidation = require('./validations/archives_approve');
const archivesDeclineValidation = require('./validations/archives_decline');
const getProductsValidation = require('./validations/get_products');
const getProductsArchivesValidation = require('./validations/get_products_archives');
const getSearchProductsValidation = require('./validations/get_search_products');
const validationCheck = require('../middlewares/validationCheck');
const productDAO = require('./product.dao');
const Product = require('./product.model');
const User = require('../user/user.model');

const router = new express.Router();
const apiVersion = 'v1';


/**
 * Create a Product
 */
 router.post(`/${apiVersion}/products`, 
    api('Create a Product'),
    auth([User.ROLE_PERSONNEL]),
    productsValidation(),
    validationCheck(),
    async (req, res) => {
        try {

            const product = await productDAO.insert(
                data = {
                    name: req.body.name,
                    description: req.body.description,
                    carMake: req.body.carMake,
                    carType: req.body.carType,
                    carYear: req.body.carYear,
                    carPart: req.body.carPart,
                }
            )

            // console.log(product);

            return req.api.status(200)
                .send(product);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }

    }
);



/**
 * Update a Product
 */
 router.post(`/${apiVersion}/products/:id`, 
    api('Update a Product'),
    auth([User.ROLE_PERSONNEL]),
    productsIdValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if product exists
            const products = await productDAO.find(where = {
                id: req.params.id,
            });

            if (products.length == 0) {
                return req.api.status(404).errors([
                    'Product Not Found!'
                ]).send();
            }

            const s = products[0];

            const updatedProducts = await productDAO.update(
                data= {
                    name: req.body.name,
                    description: req.body.description,
                    carMake: req.body.carMake,
                    carType: req.body.carType,
                    carYear: req.body.carYear,
                    carPart: req.body.carPart,
                },
                where= { id: s.id }
            )

            // console.log(updatedProducts);

            return req.api.status(200)
                .send(updatedProducts[0]);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);



/**
 * Request to Archive Product
 */
 router.post(`/${apiVersion}/products/:id/archive`, 
    api('Request to Archive'),
    auth([User.ROLE_PERSONNEL]),
    archivessValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if product exists
            const products = await productDAO.find(where = {
                id: req.params.id,
            });

            // console.dir(products, {depth: null});

            if (products.length == 0) {
                return req.api.status(404).errors([
                    'Product Not Found!'
                ]).send();
            }

            /// check if product already has archive request
            if (products[0].archiveRequest) {
                return req.api.status(400).errors([
                    'Product Already have archive request!'
                ]).send();
            }

            await productDAO.insertArchive({
                productId: req.params.id,
                requestedBy: req.user.id,
                requestedComment: req.body.comment
            });

            // console.log(updatedProducts);

            return req.api.status(200).send();

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);

/**
 * Approve Archive Request
 */
 router.post(`/${apiVersion}/products/:id/archive-approve`, 
    api('Approve Archive Request'),
    auth([User.ROLE_MANAGER]),
    archivesApproveValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if archive request exists
            const archives = await productDAO.findArchive(
                {
                    id: req.params.id,
                }, 
                {
                    isPending: true,
                }
            );

            // console.dir(products, {depth: null});

            if (archives.length == 0) {
                return req.api.status(404).errors([
                    'Request Not Found!'
                ]).send();
            }

            // check if product already 
            await productDAO.updateArchive(
                {
                    approvedBy: req.user.id,
                    approvedAt: new Date().toISOString(),
                },
                {
                    id: req.params.id
                }
            );

            // console.log(updatedProducts);

            return req.api.status(200).send();

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);


/**
 * Decline Archive Request
 */
 router.post(`/${apiVersion}/products/:id/archive-decline`, 
    api('Decline Archive Request'),
    auth([User.ROLE_MANAGER]),
    archivesDeclineValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            /// check if archive request exists
            const archives = await productDAO.findArchive(
                {
                    id: req.params.id,
                }, 
                {
                    isPending: true,
                }
            );

            // console.dir(products, {depth: null});

            if (archives.length == 0) {
                return req.api.status(404).errors([
                    'Request Not Found!'
                ]).send();
            }

            // check if product already 
            await productDAO.updateArchive(
                {
                    declinedBy: req.user.id,
                    declinedAt: new Date().toISOString(),
                },
                {
                    id: req.params.id
                }
            );

            // console.log(updatedProducts);

            return req.api.status(200).send();

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }


    }
);


/**
 * Get Product Listing
 */
 router.get(`/${apiVersion}/products`, 
    api('Get Product Listing'),
    auth([User.ROLE_PERSONNEL, User.ROLE_MANAGER]),
    getProductsValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        // console.log(req.query.withStocks == true);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;
            let like = req.query.keyword ? req.query.keyword : undefined;
            let likeSupplier = req.query.supplierKeyword ? req.query.supplierKeyword : undefined;
            let orderByColumn, orderByRule;
            if (req.query.orderBy) {
                switch(req.query.orderBy) {
                    case Product.ORDER_BY_NAME_ASC:
                        orderByColumn = 'name';
                        orderByRule = 'ASC';
                    break;
                    case Product.ORDER_BY_NAME_DESC:
                        orderByColumn = 'name';
                        orderByRule = 'DESC';

                    break;
                    case Product.ORDER_BY_DESCRIPTION_ASC:
                        orderByColumn = 'description';
                        orderByRule = 'ASC';

                    break;
                    case Product.ORDER_BY_DESCRIPTION_DESC:
                        orderByColumn = 'description';
                        orderByRule = 'DESC';
                    break;
                }
            }
            
            /// check if acc exists
            const products = await productDAO.find(
                where= {},
                options= {
                    limit: limit, 
                    skip: skip,
                    like: like,
                    likeSupplier: likeSupplier, 
                    withStocks: req.query.withStocks == 'true' ? true : undefined, 
                    withOutStocks: req.query.withStocks == 'false' ? true: undefined, 
                    orderByColumn: orderByColumn,
                    orderByRule: orderByRule,
                }
            );

            const total = await productDAO.findCount(
                where= {},
                options= {
                    like: like,
                    likeSupplier: likeSupplier,
                    withStocks: req.query.withStocks == 'true' ? true : undefined, 
                    withOutStocks: req.query.withStocks == 'false' ? true: undefined, 
                }
            );

            // console.log(products);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(products.length)
                .total(total)
                .send(products);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


/**
 * Get Product Search
 */
 router.get(`/${apiVersion}/products-search`, 
    api('Get Product Search'),
    auth([User.ROLE_PERSONNEL, User.ROLE_MANAGER]),
    getSearchProductsValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        try {

            let limit = req.query.limit;
            let keyword = req.query.keyword;
            
            /// check if acc exists
            const products = await productDAO.findLike(
                where= {
                    name: keyword,
                    description: keyword,
                },
                options= {limit: limit, skip: 0}
            );

            // console.log(total);

            return req.api.status(200)
                .send(products);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


/**
 * Get Product Archive Listing
 */
 router.get(`/${apiVersion}/products-archives`, 
    api('Get Product Archive Listing'),
    auth([User.ROLE_PERSONNEL, User.ROLE_MANAGER]),
    getProductsArchivesValidation(),
    validationCheck(),
    async (req, res) => {
        // console.log(req.params.id);
        // console.log(req.query.withStocks == true);
        try {

            let limit = req.query.limit;
            let skip = req.query.page > 1 ? (limit * req.query.page) - limit : 0;

            /// check if acc exists
            const archives = await productDAO.findArchive(
                where= {
                    requestedBy: req.user.role == User.ROLE_PERSONNEL 
                        ? req.user.id 
                        : undefined
                },
                options= {
                    limit: limit, 
                    skip: skip,
                    isPending: req.query.status == 'Pending' ? true : undefined,
                    isApproved: req.query.status == 'Approved' ? true : undefined,
                    isDeclined: req.query.status == 'Declined' ? true : undefined,
                }
            );

            const total = await productDAO.findCountArchive(
                where= {
                    requestedBy: req.user.role == User.ROLE_PERSONNEL 
                        ? req.user.id 
                        : undefined
                },
                options= {
                    isPending: req.query.status == 'Pending' ? true : undefined,
                    isApproved: req.query.status == 'Approved' ? true : undefined,
                    isDeclined: req.query.status == 'Declined' ? true : undefined,
                }
            );

            // console.log(products);

            return req.api.status(200)
                .page(req.query.page)
                .resultCount(archives.length)
                .total(total)
                .send(archives);

        } catch (error) {
            // console.log(error);
            return req.api.status(422).errors([
                'Failed processing request. Pleast try again!'
            ]).send();
        }
    }
);


module.exports = router