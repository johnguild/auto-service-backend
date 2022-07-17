

class ProductSummary {

    static tableName = 'products';

    static fromDB({
        id, 
        name,
        description, 
        car_make,
        car_type,
        car_year,
        car_part,
    }) {
        const instance = new this({
            id,  
            name,
            description,
            carMake: car_make,
            carType: car_type,
            carYear: car_year,
            carPart: car_part,
        });
        return instance;
    }

    
    constructor({ 
        id,  
        name,
        description,
        carMake,
        carType,
        carYear,
        carPart,
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.carMake = carMake;
        this.carType = carType;
        this.carYear = carYear;
        this.carPart = carPart;
    }
    
}   

module.exports = ProductSummary