
class Usage {

    static tableName = 'usages';

    static fromDB({
        id, 
        cash_id,
        amount, 
        purpose,
        created_at
    }) {
        const user = new this({
            id, 
            cashId: cash_id,
            amount,
            purpose,
            createdAt: created_at,
        });
        return user;
    }
    
    constructor({ 
        id, 
        cashId,
        amount,
        purpose,
        createdAt,
    }) {
        this.id = id;
        this.cashId = cashId;
        this.amount = amount;
        this.purpose = purpose;
        this.createdAt = createdAt;
    }
    

}   

module.exports = Usage