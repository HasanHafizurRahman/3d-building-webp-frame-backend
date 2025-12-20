import mongoose, { Document, Schema } from 'mongoose';

export interface IFloor {
    id: string;
    level: number;
    name: string;
    price: string;
    size: string;
    description: string;
    mapUrl: string;
    color: string;
    benefits: string[];
}

export interface IBuilding extends Document {
    id: string;
    name: string;
    modelPath: string;
    description: string;
    location: string;
    totalFloors: number;
    possession: string;
    features: string[];
    floors: IFloor[];
    framesBasePath: string | null;
    framesTotalCount: number;
    useFrames: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FloorSchema = new Schema<IFloor>({
    id: { type: String, required: true },
    level: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: String, required: true },
    size: { type: String, required: true },
    description: { type: String, default: '' },
    mapUrl: { type: String, default: '' },
    color: { type: String, default: '#f59e0b' },
    benefits: [{ type: String }]
});

const BuildingSchema = new Schema<IBuilding>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    modelPath: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, required: true },
    totalFloors: { type: Number, default: 0 },
    possession: { type: String, default: '' },
    features: [{ type: String }],
    floors: [FloorSchema],
    framesBasePath: { type: String, default: null },
    framesTotalCount: { type: Number, default: 0 },
    useFrames: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IBuilding>('Building', BuildingSchema, 'webp_buildings');
