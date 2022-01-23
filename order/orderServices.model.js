class OrderService {

    static tableName = 'order_services';

    static fromDB({
        id,
        order_id, 
        service_id,
        price,
    }) {
        const instance = new this({
            id,
            orderId: order_id,
            serviceId: service_id,
            price,
        });
        return instance;
    }

    
    constructor({ 
        id,
        orderId,
        serviceId,
        price,
    }) {
        this.id = id;
        this.orderId = orderId;
        this.serviceId = serviceId;
        this.price = price;
    }
    
}   

module.exports = OrderService