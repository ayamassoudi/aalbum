const express = require("express")
const {check} = require('express-validator');
const router = express.Router();

const usersController = require('../controllers/users.controller')
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT, isAdmin } = require('../middlewares/validar-jwt');
const { isDate } = require('../helpers/isDate');

// Public routes
router.post(
    '/login', 
    [
        check('email', 'Email is required').isEmail(),
        check('password', 'Password must be at least 8 characters long').isLength({min: 8}),
        validarCampos
    ], 
    usersController.login);

router.post(
    '/signup',
    [
        check('firstName', 'First name is required').not().isEmpty(),
        check('lastName', 'Last name is required').not().isEmpty(),
        check('email', 'Email is required').isEmail(),
        check('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
        check('birthDate', 'Birth date incorrect').custom(isDate),
        check('gender', 'Gender is required').not().isEmpty(),
        validarCampos
    ],
    usersController.signup
);

// Admin routes - require both JWT and admin privileges
router.get('/', [validarJWT, isAdmin], usersController.getAllUsers);
router.delete('/:id', [validarJWT, isAdmin], usersController.deleteUser);
router.put('/:id/admin-status', [validarJWT, isAdmin], usersController.updateAdminStatus);

// Protected routes that require authentication
router.get('/renew', validarJWT, usersController.revalidateToken);
router.post("/checkpassword/:id", validarJWT,
    [
        check('oldPassword', 'Old Password must be at least 8 characters long').isLength({min: 8}),
        validarCampos
    ], usersController.checkPassword);

router.put("/password/:id", validarJWT,
    [
        check('newPassword', 'New Password must be at least 8 characters long').isLength({min: 8}),
        validarCampos
    ], usersController.updatePassword);

router.put("/:id", validarJWT,
    [ 
        check('firstName', 'First name is required').not().isEmpty(),
        check('lastName', 'Last name is required').not().isEmpty(),
        check('email', 'Email is required').isEmail(),
        check('birthDate', 'Birth date incorrect').custom(isDate),
        check('gender', 'Gender is required').not().isEmpty(),
        validarCampos
    ],  usersController.updateUser);

router.get('/logout', usersController.logout);

module.exports = router;