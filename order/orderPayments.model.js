
class OrderPayment {

    static tableName = 'order_payments';

    static fromDB({
        order_id, 
        amount,
        date_time
    }) {
        const instance = new this({
            orderId: order_id,
            amount,
            dateTime: date_time,
        });
        return instance;
    }

    
    constructor({ 
        orderId,
        amount,
        dateTime,
    }) {
        this.orderId = orderId;
        this.amount = amount;
        this.dateTime = dateTime;
    }
    
}   

module.exports = OrderPayment