
class User {

    static tableName = 'users';
    static ROLE_MANAGER = 'manager';
    static ROLE_PERSONNEL = 'personnel';// inventory person
    static ROLE_CLERK = 'clerk';// tools person
    static ROLE_CUSTOMER = 'customer';

    static fromDB({
        id, 
        email, 
        mobile, 
        password, 
        first_name, 
        last_name, 
        birth_day, 
        gender, 
        is_disabled, 
        reset_password_token, 
        role, 
    }) {
        const user = new this({
            id, 
            email, 
            mobile, 
            password, 
            firstName: first_name, 
            lastName: last_name, 
            birthDay: birth_day, 
            gender, 
            isDisabled: is_disabled,
            resetPasswordToken: reset_password_token,
            role,
        });
        return user;
    }

    #password;
    #resetPasswordToken;
    #role;
    
    constructor({ 
        id, 
        email,
        mobile, 
        password, 
        firstName, 
        lastName, 
        birthDay, 
        gender, 
        isDisabled, 
        resetPasswordToken, 
        role,
    }) {
        this.id = id;
        this.email = email;
        this.mobile = mobile;
        this.firstName = firstName;
        this.lastName = lastName;
        this.birthDay = birthDay;
        this.gender = gender;
        this.isDisabled = isDisabled;
        this.role = role;
        this.#password = password;
        this.#resetPasswordToken = resetPasswordToken;
        // this.#role = role;
    }
    
    get password(){ return this.#password }
    get resetPasswordToken(){ return this.#resetPasswordToken }
    // get role(){ return this.#role }

}   

module.exports = User