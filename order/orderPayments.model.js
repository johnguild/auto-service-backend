
class OrderPayment {

    static tableName = 'order_payments';

    static fromDB({
        id,
        order_id, 
        amount,
        date_time
    }) {
        const instance = new this({
            id,
            orderId: order_id,
            amount,
            dateTime: date_time,
        });
        return instance;
    }

    
    constructor({ 
        id,
        orderId,
        amount,
        dateTime,
    }) {
        this.id = id;
        this.orderId = orderId;
        this.amount = amount;
        this.dateTime = dateTime;
    }
    
}   

module.exports = OrderPayment