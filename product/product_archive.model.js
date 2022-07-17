const ProductSummary = require('./product_summary.model');
const User = require('../user/user.model');

class ProductArchive {

    static tableName = 'product_archives';

    static fromDB({
        id,
        product_id,
        requested_by,
        requested_at,
        requested_comment,
        declined_by,
        declined_at,
        approved_by,
        approved_at,
        products = [],
        requestors = [],
    }) {
        const instance = new this({
            id,
            productId: product_id,
            requestedBy: requested_by,
            requestedAt: requested_at,
            requestedComment: requested_comment,
            declinedBy: declined_by,
            declinedAt: declined_at,
            approvedBy: approved_by,
            approvedAt: approved_at,
            product: products.length > 0 ? ProductSummary.fromDB(products[0]) : null,
            requestor: requestors.length > 0 ? User.fromDB(requestors[0]) : null, 
        });
        return instance;
    }

    
    constructor({ 
        id,
        productId,
        requestedBy,
        requestedAt,
        requestedComment,
        declinedBy,
        declinedAt,
        approvedBy,
        approvedAt,
        product, 
        requestor, 
    }) {
        this.id = id;
        this.productId = productId;
        this.requestedBy = requestedBy;
        this.requestedAt = requestedAt;
        this.requestedComment = requestedComment;
        this.declinedBy = declinedBy;
        this.declinedAt = declinedAt;
        this.approvedBy = approvedBy;
        this.approvedAt = approvedAt;
        this.product = product;
        this.requestor = requestor;
    }
    
}   

module.exports = ProductArchive