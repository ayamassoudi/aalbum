const jwt = require('jsonwebtoken');

const generarJWT = (uid, firstName, lastName, email, birthDate, gender, isAdmin) => {

    return new Promise((resolve, reject) => {
        const payload = {uid, firstName, lastName, email, birthDate, gender, isAdmin};

        jwt.sign(payload, process.env.SECRET_JWT_SEED, {
            expiresIn: '24h'
        }, (err, token) => {
            if (err){
                //console.log(err);
                reject('Token could not be generated');
            }

            resolve(token);
        });
    });
}

module.exports = {
    generarJWT
};