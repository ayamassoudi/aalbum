const {response} = require('express');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');
const User = require("../models/users.model");
const Album = require("../models/albums.model");
const Photo = require("../models/photos.model");
const HttpError = require('../models/http-error');
const { ReasonPhrases, StatusCodes } = require("http-status-codes")


// Admin Controllers
const getAllUsers = async (req, res = response) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Server error while fetching users'
        });
    }
};

const deleteUser = async (req, res = response) => {
    const userId = req.params.id;

    try {
        // Find user's albums
        const albums = await Album.find({ userId });
        
        // Delete all photos from user's albums
        for (const album of albums) {
            await Photo.deleteMany({ albumId: album.id });
        }
        
        // Delete all albums
        await Album.deleteMany({ userId });
        
        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({
            ok: true,
            message: 'User and all associated data deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Server error while deleting user'
        });
    }
};

const updateAdminStatus = async (req, res = response) => {
    const userId = req.params.id;
    const { isAdmin } = req.body;

    try {
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                ok: false,
                message: 'User not found'
            });
        }

        // Update admin status
        user.isAdmin = isAdmin;
        await user.save();

        res.json({
            ok: true,
            message: `User ${isAdmin ? 'promoted to' : 'demoted from'} admin successfully`,
            user: {
                uid: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            message: 'Server error while updating admin status'
        });
    }
};

const login = async (req, res = response, next) => {
    const { email, password } = req.body;

    try {
        const usuario = await User.findOne({email});
        
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid credentials',
            });
        }

        const validPassword = bcrypt.compareSync(password, usuario.password);

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid credentials',
            });
        }

        const token = await generarJWT(
            usuario.id, 
            usuario.firstName, 
            usuario.lastName, 
            usuario.email, 
            usuario.birthDate, 
            usuario.gender,
            usuario.isAdmin
        );

        return res
        .cookie("token", token, {
          maxAge: 24*60*60*1000,
          httpOnly: process.env.NODE_ENV === "dev",
          secure: process.env.NODE_ENV === "pro",
        })
        .status(200)
        .json({
            ok: true,
            uid: usuario.id,
            firstName: usuario.firstName,
            lastName: usuario.lastName,
            email: usuario.email,
            birthDate: usuario.birthDate,
            gender: usuario.gender,
            isAdmin: usuario.isAdmin
        });

    } catch(error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Please talk to the admin',
        });
    }
}

// ... rest of the existing controller methods ...

const revalidateToken = async (req, res = response) => {
    const {uid, firstName, lastName, email, birthDate, gender, isAdmin} = req;

    const usuario = await User.findOne({email});

    const token = await generarJWT(
        usuario.id, 
        usuario.firstName, 
        usuario.lastName, 
        usuario.email, 
        usuario.birthDate, 
        usuario.gender,
        usuario.isAdmin
    );

    return res
        .cookie("token", token, {
          maxAge: 24*60*60*1000,
          httpOnly: process.env.NODE_ENV === "dev",
          secure: process.env.NODE_ENV === "pro",
        })
        .status(200)
        .json({
            ok: true,
            uid: usuario.id,
            firstName: usuario.firstName,
            lastName: usuario.lastName,
            email: usuario.email,
            birthDate: usuario.birthDate,
            gender: usuario.gender,
            isAdmin: usuario.isAdmin
        });
}

const logout = async (req, res = response, next) => {

    return res
    .clearCookie("token")
    .status(200)
    .json({ message: "Successfully logged out" });

}

const checkPassword = async (req, res = response, next) => { //Check password by id

    const idParam = req.params.id;
    await checkAPassword(req,res,next,idParam);
    
}

const checkPassword2 = async (req, res = response, next) => { //Check password by id

    const idParam = req.query.id;
    await checkAPassword(req,res,next,idParam);

}

const checkAPassword = async (req, res = response, next, idParam) => {//Check password

    const { oldPassword } = req.body;

    try{

        const usuario = await User.findById(idParam).exec();

        if (!usuario){
            return res.status(400).json({
                ok: false,
                message: 'Invalid user ID',
            });
        }

        const validPassword = bcrypt.compareSync(oldPassword, usuario.password);

        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                message: 'Old password is invalid',
            });
        }

        res.json({
            ok: true,
            uid: usuario.id,
            firstName: usuario.firstName,
        });

    }catch(error){
        console.log(error);
        res.status(500).json({
            ok: false,
            message: 'Please talk to the admin',
        });
    }

}

const updateUser = async (req, res = response, next) => { //update a user by id

    const idParam = req.params.id;
    await updateAUser(req,res,next,idParam);
    
}

const updateUser2 = async (req, res = response, next) => { //update a user by id

    const idParam = req.query.id;
    await updateAUser(req,res,next,idParam);

}

const updateAUser = async (req, res = response, next, idParam) => {

    let oldUser;
    try{
        oldUser = await User.findById(idParam).exec();
    }catch(err){
        return next(new HttpError(err, 400))
    }



    let duplicate;

    try{
        duplicate = await User.find({_id: { $ne: idParam}, email: req.body.email}).exec();
    }catch(err){
        return next(new HttpError(err, 500))
    }

    if(duplicate[0]){
        return next(new HttpError("Email already exists", 422))
    }
    
    if (oldUser){

        const user = await User.findByIdAndUpdate(
            idParam,
            { 
                firstName: req.body.firstName, 
                lastName: req.body.lastName,
                email: req.body.email,
                password: oldUser.password, //Dont change the "password" here
                birthDate: req.body.birthDate,
                gender: req.body.gender,
            },
            {
              new: true,
            }
          ).exec();

        res.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: user,
        });
    }else{
        res.status(StatusCodes.NOT_FOUND).json({
            message: ReasonPhrases.NOT_FOUND
        });
    }

}

const updatePassword = async (req, res = response, next) => { //update a user password by id

    const idParam = req.params.id;
    await updateAUserPassword(req,res,next,idParam);
    
}

const updatePassword2 = async (req, res = response, next) => { //update a user password by id

    const idParam = req.query.id;
    await updateAUserPassword(req,res,next,idParam);
    
}

const updateAUserPassword = async (req, res = response, next, idParam) => {

    let oldUser;
    try{
        oldUser = await User.findById(idParam).exec();
    }catch(err){
        return next(new HttpError(err, 400))
    }
    
    if (oldUser){

        const pass = req.body.newPassword;

        const salt = bcrypt.genSaltSync();
        const password = bcrypt.hashSync(pass, salt);

        const user = await User.findByIdAndUpdate(
            idParam,
            { password: password, },
            {
              new: true,
            }
          ).exec();


        res.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: "Password changed",
        });
    }else{
        res.status(StatusCodes.NOT_FOUND).json({
            message: ReasonPhrases.NOT_FOUND
        });
    }

}

const deleteUsers = async (req, res = response, next) => { //delete all users

    let result;
    try{
        result = await User.deleteMany({}).exec();
    }catch(err){
        return next(new HttpError("Not found", 400))
    }
    res.json(result);

}

const signup = async (req, res = response) => {
    const { email, password, isAdmin = false, ...rest } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                ok: false,
                msg: 'Email is already in use'
            });
        }

        // Hash the password
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Create a new user
        const newUser = new User({ ...rest, email, password: hashedPassword, isAdmin });
        await newUser.save();

        // Generate a JWT
        const token = await generarJWT(
            newUser.id,
            newUser.firstName,
            newUser.lastName,
            newUser.email,
            newUser.birthDate,
            newUser.gender,
            newUser.isAdmin
        );

        res.status(201).json({
            ok: true,
            uid: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            birthDate: newUser.birthDate,
            gender: newUser.gender,
            isAdmin: newUser.isAdmin,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Please contact the administrator'
        });
    }
};

const forgotPassword = async (req, res = response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            ok: false,
            msg: 'Email is required',
        });
    }

    try {
        // Simulate sending a reset password email
        console.log(`Reset password email sent to: ${email}`);

        return res.status(200).json({
            ok: true,
            msg: 'Reset password email sent',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'An error occurred',
        });
    }
};


module.exports = {
    login,
    revalidateToken,
    logout,
    checkPassword,
    checkPassword2,
    updateUser,
    updateUser2,
    updatePassword,
    updatePassword2,
    signup,
    forgotPassword,
    getAllUsers,
    deleteUser,
    updateAdminStatus
};