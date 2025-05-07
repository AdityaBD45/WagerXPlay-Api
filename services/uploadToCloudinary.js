// services/uploadToCloudinary.js
const cloudinary = require('./cloudinary');

const uploadImageToCloudinary = async (imageBase64) => {
  try {
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'transactions',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new Error('Failed to upload image');
  }
};

module.exports = uploadImageToCloudinary;
