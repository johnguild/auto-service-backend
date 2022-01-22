
class OrderProduct {

    static tableName = 'order_products';

    static fromDB({
        id,
        order_id, 
        product_id,
        price
    }) {
        const instance = new this({
            id,
            orderId: order_id,
            productId: product_id,
            price,
        });
        return instance;
    }

    
    constructor({ 
        id,
        orderId,
        productId,
        price,
    }) {
        this.id = id;
        this.orderId = orderId;
        this.productId = productId;
        this.price = price;
    }
    
}   

module.exports = OrderProduct