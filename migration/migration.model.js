
class Migration  {

    static tableName = 'migrations';

    constructor(id, fileName) {
        this.id = id;
        this.fileName = fileName;
    }
}

module.exports = Migration;