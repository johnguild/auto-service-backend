
class OrderService {

    static tableName = 'order_services';

    static fromDB({
        order_id, 
        service_id,
        price
    }) {
        const instance = new this({
            orderId: order_id,
            serviceId: service_id,
            price,
        });
        return instance;
    }

    
    constructor({ 
        orderId,
        serviceId,
        price,
    }) {
        this.orderId = orderId;
        this.serviceId = serviceId;
        this.price = price;
    }
    
}   

module.exports = OrderService