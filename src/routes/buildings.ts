import { Router, Request, Response } from 'express';
import Building from '../models/Building';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { upload, uploadModel } from '../middleware/upload';

const router = Router();

// Get all buildings (Public)
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const buildings = await Building.find().sort({ createdAt: -1 });
        res.json(buildings);
    } catch (error) {
        console.error('Get buildings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get building by ID (Public)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const building = await Building.findOne({ id: req.params.id });
        if (!building) {
            res.status(404).json({ message: 'Building not found' });
            return;
        }
        res.json(building);
    } catch (error) {
        console.error('Get building error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create building (Protected)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const buildingData = {
            ...req.body,
            id: req.body.id || uuidv4()
        };

        const building = new Building(buildingData);
        await building.save();

        res.status(201).json(building);
    } catch (error) {
        console.error('Create building error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update building (Protected)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const building = await Building.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );

        if (!building) {
            res.status(404).json({ message: 'Building not found' });
            return;
        }

        res.json(building);
    } catch (error) {
        console.error('Update building error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete building (Protected)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const building = await Building.findOneAndDelete({ id: req.params.id });

        if (!building) {
            res.status(404).json({ message: 'Building not found' });
            return;
        }

        res.json({ message: 'Building deleted successfully' });
    } catch (error) {
        console.error('Delete building error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add floor to building (Protected)
router.post('/:id/floors', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const floorData = {
            ...req.body,
            id: req.body.id || uuidv4()
        };

        const building = await Building.findOneAndUpdate(
            { id: req.params.id },
            { $push: { floors: floorData } },
            { new: true }
        );

        if (!building) {
            res.status(404).json({ message: 'Building not found' });
            return;
        }

        res.status(201).json(building);
    } catch (error) {
        console.error('Add floor error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update floor (Protected)
router.put('/:id/floors/:floorId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const building = await Building.findOne({ id: req.params.id });

        if (!building) {
            res.status(404).json({ message: 'Building not found' });
            return;
        }

        const floorIndex = building.floors.findIndex(f => f.id === req.params.floorId);
        if (floorIndex === -1) {
            res.status(404).json({ message: 'Floor not found' });
            return;
        }

        // Update floor fields
        Object.assign(building.floors[floorIndex], req.body);
        await building.save();

        res.json(building);
    } catch (error) {
        console.error('Update floor error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete floor (Protected)
router.delete('/:id/floors/:floorId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const building = await Building.findOneAndUpdate(
            { id: req.params.id },
            { $pull: { floors: { id: req.params.floorId } } },
            { new: true }
        );

        if (!building) {
            res.status(404).json({ message: 'Building not found' });
            return;
        }

        res.json(building);
    } catch (error) {
        console.error('Delete floor error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload single frame (Protected)
router.post('/:id/upload-frame', authMiddleware, upload.single('frame'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { frameNumber } = req.body;

        if (!req.file) {
            res.status(400).json({ success: false, message: 'No frame file provided' });
            return;
        }

        if (!frameNumber) {
            res.status(400).json({ success: false, message: 'Frame number is required' });
            return;
        }

        // Verify building exists
        const building = await Building.findOne({ id });
        if (!building) {
            res.status(404).json({ success: false, message: 'Building not found' });
            return;
        }

        // Pad frame number (1 -> "001", 12 -> "012", 120 -> "120")
        const paddedNumber = String(frameNumber).padStart(3, '0');

        // Upload to Cloudinary
        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `buildings/${id}/frames`,
                    public_id: `frame_${paddedNumber}`,
                    resource_type: 'image',
                    format: 'webp',
                    overwrite: true
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // Pipe buffer to upload stream
            const bufferStream = Readable.from(req.file!.buffer);
            bufferStream.pipe(uploadStream);
        });

        res.json({
            success: true,
            url: uploadResult.secure_url
        });
    } catch (error) {
        console.error('Frame upload error:', error);
        res.status(500).json({ success: false, message: (error as Error).message || 'Failed to upload frame' });
    }
});

// Upload 3D model (Protected)
router.post('/:id/upload-model', authMiddleware, uploadModel.single('model'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        // Verify building exists
        const building = await Building.findOne({ id });
        if (!building) {
            res.status(404).json({ message: 'Building not found' });
            return;
        }

        // Upload to Cloudinary as raw file
        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `buildings/${id}/models`,
                    public_id: 'model',
                    resource_type: 'raw',
                    overwrite: true
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // Pipe buffer to upload stream
            const bufferStream = Readable.from(req.file!.buffer);
            bufferStream.pipe(uploadStream);
        });

        const url = uploadResult.secure_url;

        // Update building record
        await Building.findOneAndUpdate(
            { id },
            { $set: { modelPath: url } },
            { new: true }
        );

        res.json({ url });
    } catch (error) {
        console.error('Model upload error:', error);
        res.status(500).json({ message: 'Failed to upload model' });
    }
});

export default router;

