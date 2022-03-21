
class OrderPayment {

    static tableName = 'order_payments';

    static fromDB({
        id,
        order_id, 
        type,
        bank,
        reference_number,
        amount,
        date_time
    }) {
        const instance = new this({
            id,
            orderId: order_id,
            type,
            bank,
            referenceNumber: reference_number,
            amount,
            dateTime: date_time,
        });
        return instance;
    }

    
    constructor({ 
        id,
        orderId,
        type,
        bank,
        referenceNumber,
        amount,
        dateTime,
    }) {
        this.id = id;
        this.orderId = orderId;
        this.amount = amount;
        this.dateTime = dateTime;
        this.type = type;
        this.bank = bank;
        this.referenceNumber = referenceNumber;
    }
    
}   

module.exports = OrderPayment