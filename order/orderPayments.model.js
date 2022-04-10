
class OrderPayment {

    static tableName = 'order_payments';

    static fromDB({
        id,
        order_id, 
        type,
        bank,
        reference_number,
        account_name, 
        account_number, 
        cheque_number, 
        amount,
        date_time
    }) {
        const instance = new this({
            id,
            orderId: order_id,
            type,
            bank,
            referenceNumber: reference_number,
            accountName: account_name,
            accountNumber: account_number,
            chequeNumber: cheque_number,
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
        accountName, 
        accountNumber, 
        chequeNumber, 
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
        this.accountName = accountName; 
        this.accountNumber = accountNumber; 
        this.chequeNumber = chequeNumber; 
    }
    
}   

module.exports = OrderPayment