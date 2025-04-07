// const tf = require('@tensorflow/tfjs-node'); // Use tfjs-node for Node.js-specific features
// const sharp = require('sharp');
// const path = require('path');
// const { Photo } = require('../models/photos.model');

// // Load a pre-trained MobileNet model
// let model;
// const loadModel = async () => {
//     console.log('TensorFlow.js version:', tf.version.tfjs);
//     if (!model) {
//         try {
//             model = await tf.loadGraphModel("https://www.kaggle.com/models/google/mobilenet-v2/TfJs/035-128-classification/3", { fromTFHub: true });
//             console.log('Model loaded successfully');
//         } catch (error) {
//             console.error('Error loading model:', error.message);
//         }
//     }
// };

// // Preprocess image for TensorFlow
// const preprocessImage = async (imageBuffer) => {
//     const image = await sharp(imageBuffer).resize(224, 224).toBuffer();
//     const tensor = tf.node.decodeImage(image, 3).expandDims(0).toFloat().div(tf.scalar(255)); // Use tf.node.decodeImage
//     return tensor;
// };

// // Extract features from the image
// const extractFeatures = async (imageBuffer) => {
//     await loadModel();
//     const tensor = await preprocessImage(imageBuffer);
//     const predictions = model.predict(tensor).dataSync();

//     // Get top 5 predictions
//     const topPredictions = Array.from(predictions)
//         .map((probability, index) => ({ class: `Class ${index}`, confidence: probability }))
//         .sort((a, b) => b.confidence - a.confidence)
//         .slice(0, 5);

//     return {
//         tags: topPredictions.map(pred => pred.class),
//         objects: topPredictions.map(pred => ({ class: pred.class, confidence: pred.confidence }))
//     };
// };

// // Save photo with extracted features
// const savePhotoWithFeatures = async (photoData, imageBuffer) => {
//     const features = await extractFeatures(imageBuffer);

//     const photo = new Photo({
//         albumId: photoData.albumId,
//         name: photoData.name,
//         description: photoData.description,
//         url: photoData.url,
//         imageFeatures: features
//     });
    
//     await photo.save();
//     return photo;
// };

// module.exports = { savePhotoWithFeatures };