const Mechanic = require("../mechanic/mechanic.model");
const Tool = require("../tool/tool.model");

class Lend {

    static tableName = 'lends';

    static fromDB({
        id,
        tool_id,
        mechanic_id,
        quantity,
        borrowed_at,
        remitted_at,
        remarks, 
        mechanic, 
        tool, 
    }) {
        const instance = new this({
            id,
            toolId: tool_id,
            mechanicId: mechanic_id,
            quantity,
            borrowedAt: borrowed_at,
            remittedAt: remitted_at, 
            remarks, 
            mechanic: Mechanic.fromDB({ ...mechanic }),
            tool: Tool.fromDB({ ...tool }),
        });
        return instance;
    }

    
    constructor({ 
        id, 
        toolId,
        mechanicId,
        quantity,
        borrowedAt,
        remittedAt, 
        remarks, 
        mechanic,
        tool, 
    }) {
        this.id = id;
        this.toolId = toolId;
        this.mechanicId = mechanicId;
        this.quantity = quantity;
        this.borrowedAt = borrowedAt;
        this.remittedAt = remittedAt;
        this.remarks = remarks;
        this.mechanic = mechanic;
        this.tool = tool;
    }
    
}   

module.exports = Lend