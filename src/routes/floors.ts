import { Router, Request, Response } from 'express';
import Building from '../models/Building';
import { upload, uploadToCloudinary } from '../middleware/upload';

const router = Router();

// Get floor by ID (Public) - searches across all buildings
router.get('/:floorId', async (req: Request, res: Response): Promise<void> => {
    try {
        const building = await Building.findOne({ 'floors.id': req.params.floorId });

        if (!building) {
            res.status(404).json({ message: 'Floor not found' });
            return;
        }

        const floor = building.floors.find(f => f.id === req.params.floorId);

        if (!floor) {
            res.status(404).json({ message: 'Floor not found' });
            return;
        }

        res.json({
            ...floor,
            buildingId: building.id,
            buildingName: building.name
        });
    } catch (error) {
        console.error('Get floor error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload floor map
router.post('/:floorId/upload-map', upload.single('map'), async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        console.log('File received:', req.file.originalname, req.file.size, 'bytes');

        const building = await Building.findOne({ 'floors.id': req.params.floorId });

        if (!building) {
            res.status(404).json({ message: 'Floor not found' });
            return;
        }

        const floorIndex = building.floors.findIndex(f => f.id === req.params.floorId);

        if (floorIndex === -1) {
            res.status(404).json({ message: 'Floor not found' });
            return;
        }

        console.log('Uploading to Cloudinary...');

        // Upload to Cloudinary and get public URL
        const mapUrl = await uploadToCloudinary(req.file);

        console.log('Cloudinary URL:', mapUrl);

        // Update floor map URL
        building.floors[floorIndex].mapUrl = mapUrl;
        await building.save();

        res.json({
            message: 'Map uploaded successfully',
            mapUrl: mapUrl
        });

    } catch (error) {
        console.error('Upload map error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
