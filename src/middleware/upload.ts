import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Multer config for 3D model files
const modelFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept common 3D model formats
    const allowedMimeTypes = [
        'model/gltf-binary', // .glb
        'model/gltf+json',   // .gltf
        'application/octet-stream', // .glb, .obj (often sent as this)
    ];
    const allowedExtensions = ['.glb', '.gltf', '.obj'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Only 3D model files (.glb, .gltf, .obj) are allowed!'));
    }
};

export const uploadModel = multer({
    storage: storage,
    fileFilter: modelFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit for 3D models
    }
});

// Helper function to upload to Cloudinary
export async function uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'floor-maps',
                resource_type: 'image',
                transformation: [
                    { width: 2000, height: 2000, crop: 'limit' },
                    { quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    console.log('Uploaded to Cloudinary:', result!.secure_url);
                    resolve(result!.secure_url);
                }
            }
        );

        const readable = Readable.from(file.buffer);
        readable.pipe(uploadStream);
    });
}
