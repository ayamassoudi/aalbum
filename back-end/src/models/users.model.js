const {Schema, model} = require('mongoose');

const userSchema = Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    birthDate: {type: Date, required: true},
    gender: {type: String, required: true},
    isAdmin: {type: Boolean, default: false}
});

userSchema.method('toJSON', function () {
    const {__v, _id, ...object} = this.toObject();
    object.uid = _id;
    return object; 
});

module.exports = model('User', userSchema);