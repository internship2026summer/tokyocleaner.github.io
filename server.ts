import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to persistent data
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Core data schemas
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: 'shibuya' | 'skytree';
  startingStock: number;
  deliveries: number;
  used: number;
  currentStock: number;
  minThreshold: number;
  unit: string;
  lastUpdated: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'use' | 'delivery';
  location: 'shibuya' | 'skytree';
  itemName: string;
  quantity: number;
  staffName: string;
  notes?: string;
  source: 'google_form' | 'manual' | 'simulated';
}

// Seed Data
const initialInventory: InventoryItem[] = [
  {
    id: 'shib-01',
    name: 'Eco-Cleaner All-Purpose Spray',
    category: 'Sprays & Chemicals',
    location: 'shibuya',
    startingStock: 15,
    deliveries: 4,
    used: 7,
    currentStock: 12,
    minThreshold: 5,
    unit: 'bottles',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'shib-02',
    name: 'Microfiber Cloths (Blue)',
    category: 'Cloth & Pads',
    location: 'shibuya',
    startingStock: 30,
    deliveries: 5,
    used: 10,
    currentStock: 25,
    minThreshold: 10,
    unit: 'packs',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'shib-03',
    name: 'Heavy Duty Trash Bags (45L)',
    category: 'Trash Bags',
    location: 'shibuya',
    startingStock: 10,
    deliveries: 2,
    used: 4,
    currentStock: 8,
    minThreshold: 3,
    unit: 'rolls',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'shib-07',
    name: 'Toilet Cleaner Gel',
    category: 'Sprays & Chemicals',
    location: 'shibuya',
    startingStock: 8,
    deliveries: 0,
    used: 4,
    currentStock: 4,
    minThreshold: 5,
    unit: 'bottles',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'shib-08',
    name: 'Floor Mopping Concentrate',
    category: 'Sprays & Chemicals',
    location: 'shibuya',
    startingStock: 5,
    deliveries: 0,
    used: 3,
    currentStock: 2,
    minThreshold: 3,
    unit: 'bottles',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sky-01',
    name: 'Custom Luxury Linens Set',
    category: 'Guest Amenities',
    location: 'skytree',
    startingStock: 35,
    deliveries: 5,
    used: 8,
    currentStock: 32,
    minThreshold: 15,
    unit: 'sets',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sky-02',
    name: 'Organic Amenity Shampoo',
    category: 'Guest Amenities',
    location: 'skytree',
    startingStock: 150,
    deliveries: 20,
    used: 50,
    currentStock: 120,
    minThreshold: 50,
    unit: 'bottles',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sky-03',
    name: 'Organic Amenity Conditioner',
    category: 'Guest Amenities',
    location: 'skytree',
    startingStock: 80,
    deliveries: 5,
    used: 50,
    currentStock: 35,
    minThreshold: 50,
    unit: 'bottles',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sky-05',
    name: 'Premium Microfiber Mop Pads',
    category: 'Cloth & Pads',
    location: 'skytree',
    startingStock: 12,
    deliveries: 0,
    used: 6,
    currentStock: 6,
    minThreshold: 8,
    unit: 'packs',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sky-06',
    name: 'Airbnb Welcome Cards',
    category: 'Guest Amenities',
    location: 'skytree',
    startingStock: 25,
    deliveries: 5,
    used: 15,
    currentStock: 15,
    minThreshold: 20,
    unit: 'cards',
    lastUpdated: new Date().toISOString(),
  },
];

const initialLogs: LogEntry[] = [
  {
    id: 'log-01',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'delivery',
    location: 'shibuya',
    itemName: 'Eco-Cleaner All-Purpose Spray',
    quantity: 4,
    staffName: 'Manager Kenji',
    notes: 'Monthly bulk cleaning chemical dispatch',
    source: 'manual',
  },
  {
    id: 'log-02',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'use',
    location: 'shibuya',
    itemName: 'Eco-Cleaner All-Purpose Spray',
    quantity: 3,
    staffName: 'Cleaning Staff Yuto',
    notes: 'Standard Shibuya evening cleaning cycle',
    source: 'google_form',
  },
  {
    id: 'log-04',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'use',
    location: 'skytree',
    itemName: 'Organic Amenity Conditioner',
    quantity: 12,
    staffName: 'Cleaning Staff Haruka',
    notes: 'Skytree luxury room turn-down service',
    source: 'google_form',
  },
  {
    id: 'log-05',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'use',
    location: 'skytree',
    itemName: 'Airbnb Welcome Cards',
    quantity: 5,
    staffName: 'Cleaning Staff Haruka',
    notes: 'Placed in rooms for upcoming guests',
    source: 'google_form',
  },
];

let dbState = {
  inventory: initialInventory,
  logs: initialLogs,
};

// Ensure directories and load databases
function loadDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbState = JSON.parse(data);
      console.log('Database loaded successfully from file.');
    } else {
      saveDatabase();
      console.log('Seed database created.');
    }
  } catch (err) {
    console.error('Failed to load database:', err);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

loadDatabase();

// LAZY initialize Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

// API: Get current inventory
app.get('/api/inventory', (req, res) => {
  res.json(dbState.inventory);
});

// API: Get transaction logs
app.get('/api/logs', (req, res) => {
  res.json(dbState.logs);
});

// API: Update item threshold limit
app.put('/api/inventory/:id/threshold', (req, res) => {
  const { id } = req.params;
  const { minThreshold } = req.body;

  if (typeof minThreshold !== 'number' || minThreshold < 0) {
    res.status(400).json({ error: 'minThreshold must be a non-negative number' });
    return;
  }

  const itemIndex = dbState.inventory.findIndex((item) => item.id === id);
  if (itemIndex === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  dbState.inventory[itemIndex].minThreshold = minThreshold;
  dbState.inventory[itemIndex].lastUpdated = new Date().toISOString();
  saveDatabase();

  res.json({ success: true, item: dbState.inventory[itemIndex] });
});

// API: Manual adjustment
app.post('/api/inventory/:id/adjust', (req, res) => {
  const { id } = req.params;
  const { newStock, reason } = req.body;

  if (typeof newStock !== 'number' || newStock < 0) {
    res.status(400).json({ error: 'newStock must be a non-negative number' });
    return;
  }

  const itemIndex = dbState.inventory.findIndex((item) => item.id === id);
  if (itemIndex === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const item = dbState.inventory[itemIndex];
  const oldStock = item.currentStock;
  const difference = newStock - oldStock;

  if (difference === 0) {
    res.json({ success: true, item });
    return;
  }

  // Record a log entry
  const logType = difference > 0 ? 'delivery' : 'use';
  const quantity = Math.abs(difference);

  const log: LogEntry = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: logType,
    location: item.location,
    itemName: item.name,
    quantity,
    staffName: 'Manager Audit',
    notes: reason || 'Dashboard manual correction',
    source: 'manual',
  };

  // Update item metrics
  item.currentStock = newStock;
  if (logType === 'delivery') {
    item.deliveries += quantity;
  } else {
    item.used += quantity;
  }
  item.lastUpdated = new Date().toISOString();

  dbState.logs.unshift(log);
  // Cap logs at 100 entries
  if (dbState.logs.length > 100) {
    dbState.logs = dbState.logs.slice(0, 100);
  }

  saveDatabase();
  res.json({ success: true, item });
});

// API: Add material item
app.post('/api/inventory', (req, res) => {
  const { name, category, location, currentStock, minThreshold, unit } = req.body;

  if (!name || !category || !location || typeof currentStock !== 'number' || typeof minThreshold !== 'number' || !unit) {
    res.status(400).json({ error: 'Missing or invalid parameters to add item' });
    return;
  }

  const targetLocation = location.toLowerCase();
  if (targetLocation !== 'shibuya' && targetLocation !== 'skytree') {
    res.status(400).json({ error: 'Location must be either shibuya or skytree' });
    return;
  }

  const newItem: InventoryItem = {
    id: `item-${Date.now()}`,
    name,
    category,
    location: targetLocation,
    startingStock: currentStock,
    deliveries: 0,
    used: 0,
    currentStock,
    minThreshold,
    unit,
    lastUpdated: new Date().toISOString()
  };

  dbState.inventory.push(newItem);
  
  // Record a log entry for item creation
  const log: LogEntry = {
    id: `log-create-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'delivery',
    location: targetLocation,
    itemName: name,
    quantity: currentStock,
    staffName: 'Manager Audit',
    notes: `Added new material item to tracking list with initial stock: ${currentStock}`,
    source: 'manual'
  };

  dbState.logs.unshift(log);
  if (dbState.logs.length > 100) {
    dbState.logs = dbState.logs.slice(0, 100);
  }

  saveDatabase();
  res.status(201).json({ success: true, item: newItem });
});

// API: Delete material item
app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const itemIndex = dbState.inventory.findIndex(item => item.id === id);
  if (itemIndex === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const deletedItem = dbState.inventory[itemIndex];
  dbState.inventory.splice(itemIndex, 1);

  // Record a log entry for item deletion
  const log: LogEntry = {
    id: `log-delete-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'use',
    location: deletedItem.location,
    itemName: deletedItem.name,
    quantity: deletedItem.currentStock,
    staffName: 'Manager Audit',
    notes: `Deleted material item from tracking database (Final stock: ${deletedItem.currentStock})`,
    source: 'manual'
  };

  dbState.logs.unshift(log);
  if (dbState.logs.length > 100) {
    dbState.logs = dbState.logs.slice(0, 100);
  }

  saveDatabase();
  res.json({ success: true, message: `Successfully deleted "${deletedItem.name}"` });
});

// API: Force Reset Stock count
app.post('/api/inventory/:id/reset', (req, res) => {
  const { id } = req.params;
  const { newStock } = req.body;

  if (typeof newStock !== 'number' || newStock < 0) {
    res.status(400).json({ error: 'newStock must be a non-negative number' });
    return;
  }

  const itemIndex = dbState.inventory.findIndex(item => item.id === id);
  if (itemIndex === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const item = dbState.inventory[itemIndex];
  const oldStock = item.currentStock;

  // Force reset current, used, and deliveries
  item.currentStock = newStock;
  item.startingStock = newStock;
  item.used = 0;
  item.deliveries = 0;
  item.lastUpdated = new Date().toISOString();

  // Record reset log
  const log: LogEntry = {
    id: `log-reset-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: newStock >= oldStock ? 'delivery' : 'use',
    location: item.location,
    itemName: item.name,
    quantity: Math.abs(newStock - oldStock),
    staffName: 'Manager Audit',
    notes: `Force reset stock count from ${oldStock} to ${newStock} (Zeroed usage metrics)`,
    source: 'manual'
  };

  dbState.logs.unshift(log);
  if (dbState.logs.length > 100) {
    dbState.logs = dbState.logs.slice(0, 100);
  }

  saveDatabase();
  res.json({ success: true, item });
});

// API: Submit Intake Log
app.post('/api/logs/submit', (req, res) => {
  const { location, itemName, quantity, type, notes } = req.body;

  if (!itemName || !location || !quantity) {
    res.status(400).json({ error: 'Missing required parameters: itemName, location, and quantity' });
    return;
  }

  const targetLocation = location.toLowerCase();
  if (targetLocation !== 'shibuya' && targetLocation !== 'skytree') {
    res.status(400).json({ error: 'Location must be either shibuya or skytree' });
    return;
  }

  // Find matching item in inventory
  const itemIndex = dbState.inventory.findIndex(
    (item) => item.location === targetLocation && item.name.toLowerCase() === itemName.toLowerCase()
  );

  if (itemIndex === -1) {
    res.status(404).json({ error: `Supply item "${itemName}" not found under location "${location}"` });
    return;
  }

  const item = dbState.inventory[itemIndex];
  const parsedQty = Number(quantity);
  const actionType = type === 'delivery' ? 'delivery' : 'use';

  // Apply delta changes
  if (actionType === 'delivery') {
    item.currentStock += parsedQty;
    item.deliveries += parsedQty;
  } else {
    item.currentStock = Math.max(0, item.currentStock - parsedQty);
    item.used += parsedQty;
  }
  item.lastUpdated = new Date().toISOString();

  // Insert to Audit logs
  const log: LogEntry = {
    id: `log-intake-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: actionType,
    location: targetLocation,
    itemName: item.name,
    quantity: parsedQty,
    staffName: 'Staff Member',
    notes: notes || (actionType === 'use' ? 'Shift material consumption' : 'Supply restock delivery'),
    source: 'manual'
  };

  dbState.logs.unshift(log);
  if (dbState.logs.length > 100) {
    dbState.logs = dbState.logs.slice(0, 100);
  }

  saveDatabase();
  res.json({ status: 'success', item_updated: item.name, current_stock: item.currentStock });
});

// API: Legacy webhook mapping for backward compatibility
app.post('/api/webhook/google-form', (req, res) => {
  const { location, itemName, quantity, type, notes } = req.body;
  
  const targetLocation = location ? location.toLowerCase() : 'shibuya';
  const itemIndex = dbState.inventory.findIndex(
    (item) => item.location === targetLocation && item.name.toLowerCase() === itemName.toLowerCase()
  );

  if (itemIndex === -1) {
    res.status(404).json({ error: `Supply item not found` });
    return;
  }

  const item = dbState.inventory[itemIndex];
  const parsedQty = Number(quantity || 1);
  const actionType = type === 'delivery' ? 'delivery' : 'use';

  if (actionType === 'delivery') {
    item.currentStock += parsedQty;
    item.deliveries += parsedQty;
  } else {
    item.currentStock = Math.max(0, item.currentStock - parsedQty);
    item.used += parsedQty;
  }
  item.lastUpdated = new Date().toISOString();

  const log: LogEntry = {
    id: `log-wf-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: actionType,
    location: targetLocation,
    itemName: item.name,
    quantity: parsedQty,
    staffName: 'Staff Member',
    notes: notes || 'Logged via Webapp Intake',
    source: 'manual'
  };

  dbState.logs.unshift(log);
  saveDatabase();
  res.json({ status: 'success', item_updated: item.name, current_stock: item.currentStock });
});

// API: AI procurement package optimizer using Gemini
app.post('/api/optimize-shopping-list', async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'A list of low stock items is required' });
    return;
  }

  const ai = getAIClient();

  if (!ai) {
    // Elegant fallback if GEMINI_API_KEY is not configured
    console.log('Gemini API key missing, loading algorithmic optimization fallback.');
    const recommendations = items.map((item) => {
      const deficit = Math.max(1, item.minThreshold - item.currentStock);
      const suggestedCount = Math.max(deficit + 5, item.minThreshold * 2);
      return {
        itemName: item.name,
        suggestedPurchase: `Bulk pack of ${suggestedCount} units`,
        benefit: `Algorithmic sizing: Restores safety threshold of ${item.minThreshold} for ${item.location === 'shibuya' ? 'Shibuya Office' : 'Jeffrey Skytree'}. Buying in bulk lowers cost per item.`,
      };
    });

    res.json({
      recommendations,
      notes: 'Optimization computed locally using Tokyo Cleaner heuristic algorithm (Secrets API key not set).',
    });
    return;
  }

  try {
    const listDescription = items
      .map(
        (item) =>
          `- ${item.name} in location ${item.location}. Current Stock: ${item.currentStock}, Safety Threshold Limit: ${item.minThreshold} (${item.unit})`
      )
      .join('\n');

    const prompt = `You are a Japanese procurement consultant specializing in optimized commercial cleaning supplies and hotel-grade hospitalities.
Analyze these low stock materials and provide smart buying optimization recommendations.
For each item, recommend the optimal packaging size to purchase (e.g. bulk box, concentrate formula, pre-packed multi-packs) and state the benefit (e.g. saves 20% compared to singles, reduces plastic waste, matches turn-over rates).

Low Stock Items List:
${listDescription}

Return your recommendations STRICTLY as a JSON object matching this schema:
{
  "recommendations": [
    {
      "itemName": "string",
      "suggestedPurchase": "string detailing the target product size/bundle",
      "benefit": "string detailing the financial, operational, or green benefit"
    }
  ],
  "notes": "string with overall eco-conscious tips or shipping bundling advice"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemName: { type: Type.STRING },
                  suggestedPurchase: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                },
                required: ['itemName', 'suggestedPurchase', 'benefit'],
              },
            },
            notes: { type: Type.STRING },
          },
          required: ['recommendations'],
        },
      },
    });

    const jsonStr = response.text;
    res.json(JSON.parse(jsonStr || '{}'));
  } catch (err: any) {
    console.error('Gemini API execution error:', err);
    res.status(500).json({ error: 'AI Optimization engine encountered an error' });
  }
});

// Serve frontend build and handle SPA fallback
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
