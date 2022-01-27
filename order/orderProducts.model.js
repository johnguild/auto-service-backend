
class OrderProduct {

    static tableName = 'order_products';

    static fromDB({
        id,
        order_id, 
        service_id,
        product_id,
        price,
        quantity,
        name,
    }) {
        const instance = new this({
            id,
            orderId: order_id,
            serviceId: service_id,
            productId: product_id,
            price,
            quantity,
            name,
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
        name,
    }) {
        this.id = id;
        this.orderId = orderId;
        this.serviceId = serviceId;
        this.productId = productId;
        this.price = price;
        this.quantity = quantity;
        this.name = name;
    }
    
}   

module.exports = OrderProduct