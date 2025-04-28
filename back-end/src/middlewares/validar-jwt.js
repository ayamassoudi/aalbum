const { response } = require('express');
const jwt = require('jsonwebtoken');

const validarJWT = (req, res = response, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No token in the request'
        });
    }

    try {
        const { uid, firstName, lastName, email, birthDate, gender, isAdmin } = jwt.verify(
            token,
            process.env.SECRET_JWT_SEED
        );

        req.uid = uid;
        req.firstName = firstName;
        req.lastName = lastName;
        req.email = email;
        req.birthDate = birthDate;
        req.gender = gender;
        req.isAdmin = isAdmin;

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Invalid token'
        });
    }

    next();
}

const isAdmin = (req, res = response, next) => {
    if (!req.isAdmin) {
        return res.status(403).json({
            ok: false,
            msg: 'User is not an administrator'
        });
    }
    next();
}

module.exports = {
    validarJWT,
    isAdmin
}