
class OrderProduct {

    static tableName = 'order_products';

    static fromDB({
        order_id, 
        product_id,
        price
    }) {
        const instance = new this({
            orderId: order_id,
            productId: product_id,
            price,
        });
        return instance;
    }

    
    constructor({ 
        orderId,
        productId,
        price,
    }) {
        this.orderId = orderId;
        this.productId = productId;
        this.price = price;
    }
    
}   

module.exports = OrderProduct