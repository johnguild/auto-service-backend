class OrderService {

    static tableName = 'order_services';

    static fromDB({
        id,
        order_id, 
        service_id,
        price,
        title,
        description,
    }) {
        const instance = new this({
            id,
            orderId: order_id,
            serviceId: service_id,
            price,
            title,
            description,
        });
        return instance;
    }

    
    constructor({ 
        id,
        orderId,
        serviceId,
        price,
        title,
        description,
    }) {
        this.id = id;
        this.orderId = orderId;
        this.serviceId = serviceId;
        this.price = price;
        this.title = title;
        this.description = description;
    }
    
}   

module.exports = OrderService