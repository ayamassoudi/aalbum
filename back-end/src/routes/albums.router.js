const express = require("express")
const {check} = require('express-validator');
const router = express.Router();

const albumsController = require('../controllers/albums.controller')
const { isDate } = require('../helpers/isDate');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT, isAdmin } = require('../middlewares/validar-jwt');

router.use(validarJWT);

router.get("/", albumsController.getAlbums);
router.get("/:id", albumsController.getAlbum);
router.get("/search/:s", albumsController.getAlbumsByName);

router.post("/", 
    [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('date', 'Invalid date').custom(isDate),
        validarCampos
    ], albumsController.addAlbum);

router.put("/:id", 
    [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('date', 'Invalid date').custom(isDate),
        validarCampos
    ], albumsController.updateAlbum);

// Admin-only routes
router.delete("/:id", [isAdmin], albumsController.deleteAlbum);
router.delete("/", [isAdmin], albumsController.deleteAlbum2); 

module.exports = router;