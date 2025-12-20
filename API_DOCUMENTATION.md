# 3D Building Backend API Documentation

**Base URL:** `http://localhost:5000/api`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### Auth Routes

#### POST `/auth/register`
Create a new admin account (one-time setup).

**Request Body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Response (201):**
```json
{
  "message": "Admin created successfully"
}
```

**Error (400):**
```json
{
  "message": "Admin already exists"
}
```

---

#### POST `/auth/login`
Login and receive JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin"
  }
}
```

**Error (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

#### GET `/auth/verify`
Verify if current token is valid. **Requires Auth.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin"
  }
}
```

**Error (401):**
```json
{
  "valid": false
}
```

---

### Building Routes

#### GET `/buildings`
Get all buildings. **Public endpoint.**

**Response (200):**
```json
[
  {
    "id": "building-1",
    "name": "Skyline Tower",
    "modelPath": "/models/building.glb",
    "description": "A modern residential building",
    "location": "Downtown City",
    "totalFloors": 10,
    "possession": "December 2025",
    "features": ["Swimming Pool", "Gym", "Parking"],
    "floors": [
      {
        "id": "floor-1",
        "level": 1,
        "name": "Ground Floor",
        "price": "$250,000",
        "size": "1200 sq ft",
        "description": "Spacious ground floor apartment",
        "mapUrl": "/maps/floor1.png",
        "color": "#f59e0b",
        "benefits": ["Garden Access", "Extra Storage"]
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

#### GET `/buildings/:id`
Get a single building by ID. **Public endpoint.**

**URL Params:**
- `id` - Building ID (string)

**Response (200):**
```json
{
  "id": "building-1",
  "name": "Skyline Tower",
  "modelPath": "/models/building.glb",
  "description": "A modern residential building",
  "location": "Downtown City",
  "totalFloors": 10,
  "possession": "December 2025",
  "features": ["Swimming Pool", "Gym", "Parking"],
  "floors": [...],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error (404):**
```json
{
  "message": "Building not found"
}
```

---

#### POST `/buildings`
Create a new building. **Requires Auth.**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "building-1",           // Optional, auto-generated if not provided
  "name": "Skyline Tower",      // Required
  "modelPath": "/models/building.glb",  // Required
  "description": "A modern residential building",
  "location": "Downtown City",  // Required
  "totalFloors": 10,
  "possession": "December 2025",
  "features": ["Swimming Pool", "Gym", "Parking"],
  "floors": []                  // Optional, can add floors later
}
```

**Response (201):**
```json
{
  "id": "building-1",
  "name": "Skyline Tower",
  ...
}
```

---

#### PUT `/buildings/:id`
Update a building. **Requires Auth.**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Params:**
- `id` - Building ID (string)

**Request Body (partial update allowed):**
```json
{
  "name": "Updated Building Name",
  "description": "Updated description",
  "features": ["New Feature 1", "New Feature 2"]
}
```

**Response (200):**
```json
{
  "id": "building-1",
  "name": "Updated Building Name",
  ...
}
```

---

#### DELETE `/buildings/:id`
Delete a building. **Requires Auth.**

**Headers:**
```
Authorization: Bearer <token>
```

**URL Params:**
- `id` - Building ID (string)

**Response (200):**
```json
{
  "message": "Building deleted successfully"
}
```

---

### Floor Routes

#### GET `/floors/:floorId`
Get a floor by ID (searches across all buildings). **Public endpoint.**

**URL Params:**
- `floorId` - Floor ID (string)

**Response (200):**
```json
{
  "id": "floor-1",
  "level": 1,
  "name": "Ground Floor",
  "price": "$250,000",
  "size": "1200 sq ft",
  "description": "Spacious ground floor apartment",
  "mapUrl": "/maps/floor1.png",
  "color": "#f59e0b",
  "benefits": ["Garden Access", "Extra Storage"],
  "buildingId": "building-1",
  "buildingName": "Skyline Tower"
}
```

---

#### POST `/buildings/:id/floors`
Add a floor to a building. **Requires Auth.**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Params:**
- `id` - Building ID (string)

**Request Body:**
```json
{
  "id": "floor-2",              // Optional, auto-generated if not provided
  "level": 2,                   // Required
  "name": "Second Floor",       // Required
  "price": "$300,000",          // Required
  "size": "1400 sq ft",         // Required
  "description": "Luxury apartment with city view",
  "mapUrl": "/maps/floor2.png",
  "color": "#10b981",
  "benefits": ["Balcony", "City View"]
}
```

**Response (201):** Returns the updated building with the new floor.

---

#### PUT `/buildings/:id/floors/:floorId`
Update a floor. **Requires Auth.**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Params:**
- `id` - Building ID (string)
- `floorId` - Floor ID (string)

**Request Body (partial update allowed):**
```json
{
  "price": "$320,000",
  "description": "Updated description"
}
```

**Response (200):** Returns the updated building.

---

#### DELETE `/buildings/:id/floors/:floorId`
Delete a floor from a building. **Requires Auth.**

**Headers:**
```
Authorization: Bearer <token>
```

**URL Params:**
- `id` - Building ID (string)
- `floorId` - Floor ID (string)

**Response (200):** Returns the updated building without the deleted floor.

---

## Data Models

### Building
```typescript
{
  id: string;              // Unique identifier
  name: string;            // Building name
  modelPath: string;       // Path to 3D model file
  description: string;     // Building description
  location: string;        // Building location
  totalFloors: number;     // Total number of floors
  possession: string;      // Possession date
  features: string[];      // List of building features
  floors: Floor[];         // Array of floors
  createdAt: Date;
  updatedAt: Date;
}
```

### Floor
```typescript
{
  id: string;              // Unique identifier
  level: number;           // Floor level number
  name: string;            // Floor name
  price: string;           // Price as string (e.g., "$250,000")
  size: string;            // Size as string (e.g., "1200 sq ft")
  description: string;     // Floor description
  mapUrl: string;          // URL to floor map image
  color: string;           // Hex color for 3D visualization
  benefits: string[];      // List of floor benefits
}
```

---

## Example Frontend Integration

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const api = {
  // === PUBLIC ENDPOINTS (No Auth) ===
  
  getBuildings: async () => {
    const res = await fetch(`${API_URL}/buildings`);
    return res.json();
  },
  
  getBuilding: async (id: string) => {
    const res = await fetch(`${API_URL}/buildings/${id}`);
    return res.json();
  },
  
  getFloor: async (floorId: string) => {
    const res = await fetch(`${API_URL}/floors/${floorId}`);
    return res.json();
  },

  // === AUTH ENDPOINTS ===
  
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },
  
  register: async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },
  
  verifyToken: async (token: string) => {
    const res = await fetch(`${API_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // === PROTECTED ENDPOINTS (Require Auth) ===
  
  createBuilding: async (data: any, token: string) => {
    const res = await fetch(`${API_URL}/buildings`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  updateBuilding: async (id: string, data: any, token: string) => {
    const res = await fetch(`${API_URL}/buildings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  deleteBuilding: async (id: string, token: string) => {
    const res = await fetch(`${API_URL}/buildings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });
    return res.json();
  },
  
  addFloor: async (buildingId: string, floorData: any, token: string) => {
    const res = await fetch(`${API_URL}/buildings/${buildingId}/floors`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(floorData)
    });
    return res.json();
  },
  
  updateFloor: async (buildingId: string, floorId: string, data: any, token: string) => {
    const res = await fetch(`${API_URL}/buildings/${buildingId}/floors/${floorId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  deleteFloor: async (buildingId: string, floorId: string, token: string) => {
    const res = await fetch(`${API_URL}/buildings/${buildingId}/floors/${floorId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });
    return res.json();
  }
};
```

---

## Environment Variables

Add to `.env.local` in your Next.js frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Health Check

#### GET `/health`
Check if server is running.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
