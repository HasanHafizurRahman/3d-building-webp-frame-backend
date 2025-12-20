import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

const router = Router();

// Register admin (one-time setup)
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            res.status(400).json({ message: 'Admin already exists' });
            return;
        }

        // Create new admin
        const admin = new Admin({ username, password });
        await admin.save();

        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login admin
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ username });
        if (!admin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: admin._id },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: admin._id,
                username: admin.username
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify token
router.get('/verify', async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ valid: false });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        const admin = await Admin.findById(decoded.userId).select('-password');
        if (!admin) {
            res.status(401).json({ valid: false });
            return;
        }

        res.json({ valid: true, user: admin });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

export default router;
