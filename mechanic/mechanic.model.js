
class Mechanic {

    static tableName = 'mechanics';

    static fromDB({
        id, 
        mobile, 
        first_name, 
        last_name, 
        birth_day, 
        gender, 
        car_plates = []
    }) {
        const user = new this({
            id, 
            mobile, 
            firstName: first_name, 
            lastName: last_name, 
            birthDay: birth_day, 
            gender, 
            carPlates: car_plates
        });
        return user;
    }
    
    constructor({ 
        id, 
        mobile, 
        firstName, 
        lastName, 
        birthDay, 
        gender, 
        carPlates, 
    }) {
        this.id = id;
        this.mobile = mobile;
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDay = birthDay;
        this.gender = gender;
        this.carPlates = carPlates;
        // this.#role = role;
    }
    

}   

module.exports = Mechanic