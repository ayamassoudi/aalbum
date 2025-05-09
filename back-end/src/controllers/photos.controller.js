const { response } = require('express');
const Photo = require("../models/photos.model");
const HttpError = require('../models/http-error');
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { savePhotoWithFeatures } = require('../services/photoFeatureExtractor');
const axios = require('axios');

cloudinary.config({ 
    cloud_name: 'dmoyjwecg', 
    api_key: '785266648473674',
    api_secret: 'vqMoLhsgwZiY-0FcnK_4F0caJBM',
    secure: true
}); 

const getSignature = async (req, res = response, next) => { //get signature

    signature = cloudinary.utils.api_sign_request(
        req.query,
        cloudinary.config().api_secret
    );
    res.send(signature);

}



// const addPhoto = async (req, res = response, next) => {//add a photo

//     const addedPhoto = new Photo(req.body);

//     try{
        
//         const photo = await addedPhoto.save();

//         res.status(StatusCodes.CREATED).json({
//             message: ReasonPhrases.CREATED,
//             data: photo
//         })

//     }catch(err){
//         return next(new HttpError(err, 500))
//     }
// }

const addPhoto = async (req, res = response, next) => {
    try {
        const { albumId, name, description, url} = req.body;

        // Read the uploaded file
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        // Save photo with extracted features
        const photo = await savePhotoWithFeatures(
            { albumId, name, description, url: url },
            imageBuffer
        );

        res.status(StatusCodes.CREATED).json({
            message: ReasonPhrases.CREATED,
            data: photo
        });
    } catch (error) {
        next(new HttpError(error.message || 'Failed to upload photo', 500));
    }
};

const getPhotos = async (req, res = response, next) => { //find all photos, photos by albumId, photo by id, photos by name (search case insensitive)

    const idParam = req.query.id;
    const searchName = req.query.s;
    const albumId = req.query.albumId;
    const tag = req.query.tag;
    const width = req.query.width;
    const height = req.query.height;
    const color = req.query.color;

    const albumIdCount = req.query.albumIdCount;
    const albumName = req.query.albumName;

    if(albumIdCount && albumName){

        Photo.countDocuments({albumId:albumIdCount}, function (err, count) {
            if (!err){
                //console.log(count);
                res.status(StatusCodes.OK).json({
                    message: ReasonPhrases.OK,
                    data: {albumName: albumName, count: count}
                });
            }else{
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: ReasonPhrases.BAD_REQUEST,
                    data: err
                });
            }
        });
        

    } else if(albumId) {
        let query = { albumId };
        
        // Build advanced search query
        if (searchName) {
            query.name = { $regex: searchName, $options: "i" };
        }
        if (tag) {
            query['imageFeatures.tags'] = { $regex: tag, $options: "i" };
        }
        if (width) {
            query['imageFeatures.metadata.width'] = parseInt(width);
        }
        if (height) {
            query['imageFeatures.metadata.height'] = parseInt(height);
        }
        if (color) {
            query['imageFeatures.dominantColors.color'] = { $regex: color, $options: "i" };
        }

        let photos;
        try {
            photos = await Photo.find(query);
        } catch(err) {
            return next(new HttpError("Not found", 400));
        }

        if(photos[0]) {
            res.status(StatusCodes.OK).json({
                message: ReasonPhrases.OK,
                data: photos
            });
        } else {
            res.status(StatusCodes.NOT_FOUND).json({
                message: ReasonPhrases.NOT_FOUND
            });
        }

    }else if(idParam){

        let photo;

        try{
            photo = await Photo.findById(idParam).exec();
        }catch(err){
            return next(new HttpError("Not found", 400))
        }

        if(photo){
            res.status(StatusCodes.OK).json({
                message: ReasonPhrases.OK,
                data: photo
            });
        }else{
            res.status(StatusCodes.NOT_FOUND).json({
                message: ReasonPhrases.NOT_FOUND
            });
        }

    }else{

        let photos;
        try{
            photos = await Photo.find().exec();
        }catch(err){
            return next(new HttpError(err, 404))
        }
        res.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: photos,
        });

    }

}

const getPhoto = async (req, res = response, next) => { //find a photo by id

    const idParam = req.params.id;
    let photo;

    try{
        photo = await Photo.findById(idParam).exec();
    }catch(err){
        return next(new HttpError("Not found", 400))
    }

    if(photo){
        res.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: photo
        });
    }else{
        res.status(StatusCodes.NOT_FOUND).json({
            message: ReasonPhrases.NOT_FOUND
        });
    }
}

const getPhotosByName = async (req, res = response, next) => { //find photos by name (search case insensitive)

    const albumId = req.params.albumId;
    const searchName = req.params.s;
    let photos;

    try{
        photos = await Photo.find({ albumId: albumId, name: { $regex: searchName, $options: "i" } }); //Case insensitive
    }catch(err){
        return next(new HttpError("Not found", 400))
    }

    if(photos[0]){
        res.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: photos
        });
    }else{
        res.status(StatusCodes.NOT_FOUND).json({
            message: ReasonPhrases.NOT_FOUND
        });
    }
}

const updatePhoto = async (req, res = response, next) => { //update a photo by id

    const idParam = req.params.id;
    await updateAPhoto(req,res,next,idParam);
    
}

const updatePhoto2 = async (req, res = response, next) => { //update a photo by id

    const idParam = req.query.id;
    await updateAPhoto(req,res,next,idParam);

}

const updateAPhoto = async (req, res = response, next, idParam) => {
    
    const newPhoto = {
        ...req.body
    }

    let photo;
    try{

        photo = await Photo.findByIdAndUpdate(idParam, newPhoto, {new: true}).exec();

    }catch(err){
        return next(new HttpError(err, 400))
    }

    if (photo){
        res.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: photo
        });
    }else{
        res.status(StatusCodes.NOT_FOUND).json({
            message: ReasonPhrases.NOT_FOUND
        });
    }

}

const deletePhoto = async (req, res = response, next) => { //delete a photo by id

    const idParam = req.params.id;
    const cloudinaryIdParam = req.params.cid;
    await deleteAPhoto(req,res,next,idParam,cloudinaryIdParam);
    
}

const deletePhoto2 = async (req, res = response, next) => { //delete a photo by id

    const idParam = req.query.id;
    const cloudinaryIdParam = req.params.cid;
    await deleteAPhoto(req,res,next,idParam,cloudinaryIdParam);

}

const deleteAPhoto = async (req, res = response, next, idParam, cloudinaryIdParam) => { 

    try{

        const cloudResp = await cloudinary.api.delete_resources(['social-app/' + cloudinaryIdParam], {
            resource_type: 'image'
        })
        //console.log(cloudResp);

        await Photo.findByIdAndDelete(idParam);

        res.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: "Photo Deleted",
        });

    }catch(err){

        res.status(StatusCodes.NOT_FOUND).json({
            message: ReasonPhrases.NOT_FOUND
        });
        
    }

}

const deletePhotos = async (req, res = response, next) => { 

    const mIds = req.query.mIds;
    const cIds = req.query.cIds;

    const mIdsA = mIds.split(',');
    const cIdsA = cIds.split(',');

    try{

        const mongoPromises = [];
        mIdsA.forEach(mId => {
            mongoPromises.push(
                Photo.findByIdAndDelete(mId)
            )
        })

        await Promise.all(mongoPromises);

        const cloudResp = await cloudinary.api.delete_resources(cIdsA, {
            resource_type: 'image'
        })
        //console.log(cloudResp);

        res.status(StatusCodes.OK).json({
            message: ReasonPhrases.OK,
            data: "Photos Deleted",
        });

    }catch(err){

        res.status(StatusCodes.NOT_FOUND).json({
            message: ReasonPhrases.NOT_FOUND
        });
        
    }

}

exports.addPhoto = addPhoto;
exports.getPhotos = getPhotos;
exports.getPhotosByName = getPhotosByName;
exports.getPhoto = getPhoto;
exports.getSignature = getSignature;
exports.updatePhoto = updatePhoto;
exports.updatePhoto2 = updatePhoto2;
exports.deletePhoto = deletePhoto;
exports.deletePhoto2 = deletePhoto2;
exports.deletePhotos = deletePhotos;