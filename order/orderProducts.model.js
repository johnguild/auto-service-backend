
class OrderProduct {

    static tableName = 'order_products';

    static fromDB({
        id,
        order_id, 
        service_id,
        product_id,
        price,
        quantity,
    }) {
        const instance = new this({
            id,
            orderId: order_id,
            serviceId: service_id,
            productId: product_id,
            price,
            quantity,
        });
        return instance;
    }

    
    constructor({ 
        id,
        orderId,
        serviceId,
        productId,
        price,
        quantity,
    }) {
        this.id = id;
        this.orderId = orderId;
        this.serviceId = serviceId;
        this.productId = productId;
        this.price = price;
        this.quantity = quantity;
    }
    
}   

module.exports = OrderProduct