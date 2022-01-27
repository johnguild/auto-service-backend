class OrderService {

    static tableName = 'order_services';

    static fromDB({
        id,
        order_id, 
        service_id,
        price,
        title,
    }) {
        const instance = new this({
            id,
            orderId: order_id,
            serviceId: service_id,
            price,
            title,
        });
        return instance;
    }

    
    constructor({ 
        id,
        orderId,
        serviceId,
        price,
        title,
    }) {
        this.id = id;
        this.orderId = orderId;
        this.serviceId = serviceId;
        this.price = price;
        this.title = title;
    }
    
}   

module.exports = OrderService