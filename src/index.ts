import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import buildingsRoutes from './routes/buildings';
import floorsRoutes from './routes/floors';

// Load environment variables

const app = express();

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'https://3d-building-webp-frame-client.vercel.app'
        ];

        if (process.env.FRONTEND_URL) {
            // Add the env var URL, stripping any trailing slash to ensure consistency
            allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
        }

        // Allow requests with no origin (like mobile apps, curl, or same-origin) or if origin is in allowlist
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin || true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buildings', buildingsRoutes);
app.use('/api/floors', floorsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '3D Building Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            buildings: '/api/buildings',
            floors: '/api/floors'
        }
    });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
        });
    })
    .catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });

