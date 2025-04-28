import mainApi from "../api/mainApi";
import { getEnvVariables } from "./getEnvVariables";

const { VITE_CLOUD_NAME, VITE_API_KEY, VITE_UPLOAD_PRESET } = getEnvVariables();

export const fileUpload = async (file) => {
    if (!file) throw new Error('No file to upload');

    try {
        // Get signature for secure upload
        const timestamp = Math.round(new Date().getTime() / 1000);
        const { data: signature } = await mainApi.get(
            `/photos/signature?timestamp=${timestamp}&upload_preset=${VITE_UPLOAD_PRESET}`
        );

        // Prepare upload to Cloudinary
        const cloudUrl = `https://api.cloudinary.com/v1_1/${VITE_CLOUD_NAME}/image/upload`;
        const formData = new FormData();
        formData.append('upload_preset', VITE_UPLOAD_PRESET);
        formData.append('file', file);
        formData.append('api_key', VITE_API_KEY);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);

        // Upload to Cloudinary
        const resp = await fetch(cloudUrl, {
            method: 'POST',
            body: formData
        });

        if (!resp.ok) {
            const errorData = await resp.json();
            throw new Error(errorData.error?.message || 'Failed to upload file');
        }

        const cloudResp = await resp.json();
        return cloudResp.secure_url;
    } catch (error) {
        console.error('File upload error:', error);
        throw new Error(error.message || 'Failed to upload file');
    }
}