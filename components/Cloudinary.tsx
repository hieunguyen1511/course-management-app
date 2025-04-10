import axiosInstance from '@/api/axiosInstance';
import { sha1 } from 'js-sha1';

const uploadToCloudinary = async (imageUri: string) => {
  try {
    const upload_preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_COURSE_PRESET;
    const cloud_name = process.env.EXPO_PUBLIC_CLOUDINARY_COURSE_CLOUD_NAME;
    const upload_url = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_COURSE_API_URL;

    if (!upload_preset || !cloud_name || !upload_url) {
      throw new Error('Cloudinary configuration is missing');
    }

    const formData = new FormData();

    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('file', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: `photo.${fileType}`,
    } as any);

    formData.append('upload_preset', upload_preset);
    formData.append('cloud_name', cloud_name);

    const response = await fetch(`${upload_url}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

const extractPublicId = (uri: string): string => {
  const parts = uri.split('/');
  const fileNameWithExt = parts.pop();
  const fileName = fileNameWithExt?.split('.').slice(0, -1).join('.') || '';

  const uploadIndex = parts.findIndex(p => p === 'upload');

  const nextPart = parts[uploadIndex + 1];
  const isVersion = /^v\d+$/.test(nextPart);
  const rest = parts.slice(uploadIndex + (isVersion ? 2 : 1));

  if (rest.length === 0) return fileName;
  return `${rest.join('/')}/${fileName}`;
};

const generateSignature = (publicId: string, timestamp: number, apiSecret: string) => {
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  return sha1(stringToSign);
};

const deleteImagefromCloudinary = async (uri: string) => {
  try {
    const url_destroy = process.env.EXPO_PUBLIC_CLOUDINARY_DESTROY_COURSE_API_URL;
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_COURSE_CLOUD_NAME;
    const apiKey = process.env.EXPO_PUBLIC_CLOUDINARY_COURSE_CLOUD_API_KEY;
    const apiSecret = process.env.EXPO_PUBLIC_CLOUDINARY_COURSE_CLOUD_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Thiếu thông tin cấu hình Cloudinary');
    }
    const publicId = extractPublicId(uri);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateSignature(publicId, timestamp, apiSecret);

    await axiosInstance.post(`${url_destroy}`, {
      public_id: publicId,
      timestamp,
      api_key: apiKey,
      signature,
    });
    return true;
  } catch (error) {
    console.error('Unable to delete image: ', error);
    return false;
  }
};

export { uploadToCloudinary, deleteImagefromCloudinary };
