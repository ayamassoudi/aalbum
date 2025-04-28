const tf = require('@tensorflow/tfjs');
const sharp = require('sharp');
const { createCanvas, Image } = require('canvas');
const Photo = require('../models/photos.model');
const fetch = require('node-fetch');
const colorNamer = require('color-namer');

// Load a pre-trained MobileNet model
let model;
const loadModel = async () => {
    console.log('TensorFlow.js version:', tf.version.tfjs);
    if (!model) {
        try {
            console.log('Attempting to load model from:', 'https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json');
            model = await tf.loadGraphModel('https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json');
            console.log('Model loaded successfully');
        } catch (error) {
            console.error('Error loading model:', error.message);
        }
    }
};

// Load label map for MobileNet
let labelMap;
const loadLabelMap = async () => {
    if (!labelMap) {
        try {
            const response = await fetch('https://storage.googleapis.com/download.tensorflow.org/data/imagenet_class_index.json');
            labelMap = await response.json();
        } catch (error) {
            console.error('Error loading label map:', error.message);
        }
    }
};

// Extract image metadata (dimensions and format)
const extractImageMetadata = async (imageBuffer) => {
    try {
        const metadata = await sharp(imageBuffer).metadata();
        const result = {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format
        };
        console.log('Extracted metadata:', result);
        return result;
    } catch (error) {
        console.error('Error extracting metadata:', error);
        throw error; // Throw error to handle it in the calling function
    }
};

// Preprocess image for TensorFlow
const preprocessImage = async (imageBuffer) => {
    const image = await sharp(imageBuffer).resize(224, 224).toBuffer();
    const canvas = createCanvas(224, 224);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = image;
    ctx.drawImage(img, 0, 0, 224, 224);

    const imageTensor = tf.browser.fromPixels(canvas).div(255.0).expandDims(0);
    return imageTensor;
};

// Extract dominant colors from the image
const extractDominantColors = async (imageBuffer) => {
    const stats = await sharp(imageBuffer).stats();
    const { r, g, b } = stats.dominant;
    const rgb = `rgb(${r}, ${g}, ${b})`;

    // Get the closest color name using color-namer
    const namedColors = colorNamer(rgb);
    const closestColorName = namedColors.basic[0]?.name || 'Unknown';

    return [{
        color: closestColorName,
        rgb: rgb,
        percentage: stats.dominant.population
    }];
};

// Extract features from the image
const extractFeatures = async (imageBuffer) => {
    await loadModel();
    await loadLabelMap();

    if (!model || !labelMap) {
        throw new Error('Model or label map is not loaded');
    }

    // Extract metadata first
    const metadata = await extractImageMetadata(imageBuffer);
    
    const tensor = await preprocessImage(imageBuffer);
    const predictions = model.predict(tensor).dataSync();

    // Get top 5 predictions
    const topPredictions = Array.from(predictions)
        .map((probability, index) => ({
            class: labelMap[index]?.[1] || `Class ${index}`,
            confidence: probability * 100 // Convert to percentage
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

    // Extract dominant colors
    const dominantColors = await extractDominantColors(imageBuffer);

    const features = {
        tags: topPredictions.map(pred => pred.class),
        objects: topPredictions.map(pred => ({ class: pred.class, confidence: pred.confidence })),
        dominantColors: dominantColors,
        metadata: metadata // Include metadata in features
    };

    console.log('Extracted features:', features);
    return features;
};

// Save photo with extracted features
const savePhotoWithFeatures = async (photoData, imageBuffer) => {
    const features = await extractFeatures(imageBuffer);

    const photo = new Photo({
        albumId: photoData.albumId,
        name: photoData.name,
        description: photoData.description,
        url: photoData.url,
        imageFeatures: features
    });
    
    await photo.save();
    return photo;
};

module.exports = { savePhotoWithFeatures };