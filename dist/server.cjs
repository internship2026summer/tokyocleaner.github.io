var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "db.json");
var initialInventory = [
  {
    id: "shib-01",
    name: "Eco-Cleaner All-Purpose Spray",
    category: "Sprays & Chemicals",
    location: "shibuya",
    startingStock: 15,
    deliveries: 4,
    used: 7,
    currentStock: 12,
    minThreshold: 5,
    unit: "bottles",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "shib-02",
    name: "Microfiber Cloths (Blue)",
    category: "Cloth & Pads",
    location: "shibuya",
    startingStock: 30,
    deliveries: 5,
    used: 10,
    currentStock: 25,
    minThreshold: 10,
    unit: "packs",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "shib-03",
    name: "Heavy Duty Trash Bags (45L)",
    category: "Trash Bags",
    location: "shibuya",
    startingStock: 10,
    deliveries: 2,
    used: 4,
    currentStock: 8,
    minThreshold: 3,
    unit: "rolls",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "shib-07",
    name: "Toilet Cleaner Gel",
    category: "Sprays & Chemicals",
    location: "shibuya",
    startingStock: 8,
    deliveries: 0,
    used: 4,
    currentStock: 4,
    minThreshold: 5,
    unit: "bottles",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "shib-08",
    name: "Floor Mopping Concentrate",
    category: "Sprays & Chemicals",
    location: "shibuya",
    startingStock: 5,
    deliveries: 0,
    used: 3,
    currentStock: 2,
    minThreshold: 3,
    unit: "bottles",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "sky-01",
    name: "Custom Luxury Linens Set",
    category: "Guest Amenities",
    location: "skytree",
    startingStock: 35,
    deliveries: 5,
    used: 8,
    currentStock: 32,
    minThreshold: 15,
    unit: "sets",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "sky-02",
    name: "Organic Amenity Shampoo",
    category: "Guest Amenities",
    location: "skytree",
    startingStock: 150,
    deliveries: 20,
    used: 50,
    currentStock: 120,
    minThreshold: 50,
    unit: "bottles",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "sky-03",
    name: "Organic Amenity Conditioner",
    category: "Guest Amenities",
    location: "skytree",
    startingStock: 80,
    deliveries: 5,
    used: 50,
    currentStock: 35,
    minThreshold: 50,
    unit: "bottles",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "sky-05",
    name: "Premium Microfiber Mop Pads",
    category: "Cloth & Pads",
    location: "skytree",
    startingStock: 12,
    deliveries: 0,
    used: 6,
    currentStock: 6,
    minThreshold: 8,
    unit: "packs",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "sky-06",
    name: "Airbnb Welcome Cards",
    category: "Guest Amenities",
    location: "skytree",
    startingStock: 25,
    deliveries: 5,
    used: 15,
    currentStock: 15,
    minThreshold: 20,
    unit: "cards",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var initialLogs = [
  {
    id: "log-01",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1e3).toISOString(),
    type: "delivery",
    location: "shibuya",
    itemName: "Eco-Cleaner All-Purpose Spray",
    quantity: 4,
    staffName: "Manager Kenji",
    notes: "Monthly bulk cleaning chemical dispatch",
    source: "manual"
  },
  {
    id: "log-02",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString(),
    type: "use",
    location: "shibuya",
    itemName: "Eco-Cleaner All-Purpose Spray",
    quantity: 3,
    staffName: "Cleaning Staff Yuto",
    notes: "Standard Shibuya evening cleaning cycle",
    source: "google_form"
  },
  {
    id: "log-04",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
    type: "use",
    location: "skytree",
    itemName: "Organic Amenity Conditioner",
    quantity: 12,
    staffName: "Cleaning Staff Haruka",
    notes: "Skytree luxury room turn-down service",
    source: "google_form"
  },
  {
    id: "log-05",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString(),
    type: "use",
    location: "skytree",
    itemName: "Airbnb Welcome Cards",
    quantity: 5,
    staffName: "Cleaning Staff Haruka",
    notes: "Placed in rooms for upcoming guests",
    source: "google_form"
  }
];
var dbState = {
  inventory: initialInventory,
  logs: initialLogs
};
function loadDatabase() {
  try {
    if (!import_fs.default.existsSync(DATA_DIR)) {
      import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (import_fs.default.existsSync(DB_FILE)) {
      const data = import_fs.default.readFileSync(DB_FILE, "utf-8");
      dbState = JSON.parse(data);
      console.log("Database loaded successfully from file.");
    } else {
      saveDatabase();
      console.log("Seed database created.");
    }
  } catch (err) {
    console.error("Failed to load database:", err);
  }
}
function saveDatabase() {
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database:", err);
  }
}
loadDatabase();
var aiClient = null;
function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new import_genai.GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }
  return aiClient;
}
app.get("/api/inventory", (req, res) => {
  res.json(dbState.inventory);
});
app.get("/api/logs", (req, res) => {
  res.json(dbState.logs);
});
app.put("/api/inventory/:id/threshold", (req, res) => {
  const { id } = req.params;
  const { minThreshold } = req.body;
  if (typeof minThreshold !== "number" || minThreshold < 0) {
    res.status(400).json({ error: "minThreshold must be a non-negative number" });
    return;
  }
  const itemIndex = dbState.inventory.findIndex((item) => item.id === id);
  if (itemIndex === -1) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  dbState.inventory[itemIndex].minThreshold = minThreshold;
  dbState.inventory[itemIndex].lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  saveDatabase();
  res.json({ success: true, item: dbState.inventory[itemIndex] });
});
app.post("/api/inventory/:id/adjust", (req, res) => {
  const { id } = req.params;
  const { newStock, reason } = req.body;
  if (typeof newStock !== "number" || newStock < 0) {
    res.status(400).json({ error: "newStock must be a non-negative number" });
    return;
  }
  const itemIndex = dbState.inventory.findIndex((item2) => item2.id === id);
  if (itemIndex === -1) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  const item = dbState.inventory[itemIndex];
  const oldStock = item.currentStock;
  const difference = newStock - oldStock;
  if (difference === 0) {
    res.json({ success: true, item });
    return;
  }
  const logType = difference > 0 ? "delivery" : "use";
  const quantity = Math.abs(difference);
  const log = {
    id: `log-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: logType,
    location: item.location,
    itemName: item.name,
    quantity,
    staffName: "Manager Audit",
    notes: reason || "Dashboard manual correction",
    source: "manual"
  };
  item.currentStock = newStock;
  if (logType === "delivery") {
    item.deliveries += quantity;
  } else {
    item.used += quantity;
  }
  item.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  dbState.logs.unshift(log);
  if (dbState.logs.length > 100) {
    dbState.logs = dbState.logs.slice(0, 100);
  }
  saveDatabase();
  res.json({ success: true, item });
});
app.post("/api/inventory", (req, res) => {
  const { name, category, location, currentStock, minThreshold, unit } = req.body;
  if (!name || !category || !location || typeof currentStock !== "number" || typeof minThreshold !== "number" || !unit) {
    res.status(400).json({ error: "Missing or invalid parameters to add item" });
    return;
  }
  const targetLocation = location.toLowerCase();
  if (targetLocation !== "shibuya" && targetLocation !== "skytree") {
    res.status(400).json({ error: "Location must be either shibuya or skytree" });
    return;
  }
  const newItem = {
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
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbState.inventory.push(newItem);
  const log = {
    id: `log-create-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "delivery",
    location: targetLocation,
    itemName: name,
    quantity: currentStock,
    staffName: "Manager Audit",
    notes: `Added new material item to tracking list with initial stock: ${currentStock}`,
    source: "manual"
  };
  dbState.logs.unshift(log);
  if (dbState.logs.length > 100) {
    dbState.logs = dbState.logs.slice(0, 100);
  }
  saveDatabase();
  res.status(201).json({ success: true, item: newItem });
});
app.delete("/api/inventory/:id", (req, res) => {
  const { id } = req.params;
  const itemIndex = dbState.inventory.findIndex((item) => item.id === id);
  if (itemIndex === -1) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  const deletedItem = dbState.inventory[itemIndex];
  dbState.inventory.splice(itemIndex, 1);
  const log = {
    id: `log-delete-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: "use",
    location: deletedItem.location,
    itemName: deletedItem.name,
    quantity: deletedItem.currentStock,
    staffName: "Manager Audit",
    notes: `Deleted material item from tracking database (Final stock: ${deletedItem.currentStock})`,
    source: "manual"
  };
  dbState.logs.unshift(log);
  if (dbState.logs.length > 100) {
    dbState.logs = dbState.logs.slice(0, 100);
  }
  saveDatabase();
  res.json({ success: true, message: `Successfully deleted "${deletedItem.name}"` });
});
app.post("/api/inventory/:id/reset", (req, res) => {
  const { id } = req.params;
  const { newStock } = req.body;
  if (typeof newStock !== "number" || newStock < 0) {
    res.status(400).json({ error: "newStock must be a non-negative number" });
    return;
  }
  const itemIndex = dbState.inventory.findIndex((item2) => item2.id === id);
  if (itemIndex === -1) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  const item = dbState.inventory[itemIndex];
  const oldStock = item.currentStock;
  item.currentStock = newStock;
  item.startingStock = newStock;
  item.used = 0;
  item.deliveries = 0;
  item.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  const log = {
    id: `log-reset-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: newStock >= oldStock ? "delivery" : "use",
    location: item.location,
    itemName: item.name,
    quantity: Math.abs(newStock - oldStock),
    staffName: "Manager Audit",
    notes: `Force reset stock count from ${oldStock} to ${newStock} (Zeroed usage metrics)`,
    source: "manual"
  };
  dbState.logs.unshift(log);
  if (dbState.logs.length > 100) {
    dbState.logs = dbState.logs.slice(0, 100);
  }
  saveDatabase();
  res.json({ success: true, item });
});
app.post("/api/logs/submit", (req, res) => {
  const { location, itemName, quantity, type, notes } = req.body;
  if (!itemName || !location || !quantity) {
    res.status(400).json({ error: "Missing required parameters: itemName, location, and quantity" });
    return;
  }
  const targetLocation = location.toLowerCase();
  if (targetLocation !== "shibuya" && targetLocation !== "skytree") {
    res.status(400).json({ error: "Location must be either shibuya or skytree" });
    return;
  }
  const itemIndex = dbState.inventory.findIndex(
    (item2) => item2.location === targetLocation && item2.name.toLowerCase() === itemName.toLowerCase()
  );
  if (itemIndex === -1) {
    res.status(404).json({ error: `Supply item "${itemName}" not found under location "${location}"` });
    return;
  }
  const item = dbState.inventory[itemIndex];
  const parsedQty = Number(quantity);
  const actionType = type === "delivery" ? "delivery" : "use";
  if (actionType === "delivery") {
    item.currentStock += parsedQty;
    item.deliveries += parsedQty;
  } else {
    item.currentStock = Math.max(0, item.currentStock - parsedQty);
    item.used += parsedQty;
  }
  item.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  const log = {
    id: `log-intake-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: actionType,
    location: targetLocation,
    itemName: item.name,
    quantity: parsedQty,
    staffName: "Staff Member",
    notes: notes || (actionType === "use" ? "Shift material consumption" : "Supply restock delivery"),
    source: "manual"
  };
  dbState.logs.unshift(log);
  if (dbState.logs.length > 100) {
    dbState.logs = dbState.logs.slice(0, 100);
  }
  saveDatabase();
  res.json({ status: "success", item_updated: item.name, current_stock: item.currentStock });
});
app.post("/api/webhook/google-form", (req, res) => {
  const { location, itemName, quantity, type, notes } = req.body;
  const targetLocation = location ? location.toLowerCase() : "shibuya";
  const itemIndex = dbState.inventory.findIndex(
    (item2) => item2.location === targetLocation && item2.name.toLowerCase() === itemName.toLowerCase()
  );
  if (itemIndex === -1) {
    res.status(404).json({ error: `Supply item not found` });
    return;
  }
  const item = dbState.inventory[itemIndex];
  const parsedQty = Number(quantity || 1);
  const actionType = type === "delivery" ? "delivery" : "use";
  if (actionType === "delivery") {
    item.currentStock += parsedQty;
    item.deliveries += parsedQty;
  } else {
    item.currentStock = Math.max(0, item.currentStock - parsedQty);
    item.used += parsedQty;
  }
  item.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  const log = {
    id: `log-wf-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    type: actionType,
    location: targetLocation,
    itemName: item.name,
    quantity: parsedQty,
    staffName: "Staff Member",
    notes: notes || "Logged via Webapp Intake",
    source: "manual"
  };
  dbState.logs.unshift(log);
  saveDatabase();
  res.json({ status: "success", item_updated: item.name, current_stock: item.currentStock });
});
app.post("/api/optimize-shopping-list", async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "A list of low stock items is required" });
    return;
  }
  const ai = getAIClient();
  if (!ai) {
    console.log("Gemini API key missing, loading algorithmic optimization fallback.");
    const recommendations = items.map((item) => {
      const deficit = Math.max(1, item.minThreshold - item.currentStock);
      const suggestedCount = Math.max(deficit + 5, item.minThreshold * 2);
      return {
        itemName: item.name,
        suggestedPurchase: `Bulk pack of ${suggestedCount} units`,
        benefit: `Algorithmic sizing: Restores safety threshold of ${item.minThreshold} for ${item.location === "shibuya" ? "Shibuya Office" : "Jeffrey Skytree"}. Buying in bulk lowers cost per item.`
      };
    });
    res.json({
      recommendations,
      notes: "Optimization computed locally using Tokyo Cleaner heuristic algorithm (Secrets API key not set)."
    });
    return;
  }
  try {
    const listDescription = items.map(
      (item) => `- ${item.name} in location ${item.location}. Current Stock: ${item.currentStock}, Safety Threshold Limit: ${item.minThreshold} (${item.unit})`
    ).join("\n");
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
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            recommendations: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  itemName: { type: import_genai.Type.STRING },
                  suggestedPurchase: { type: import_genai.Type.STRING },
                  benefit: { type: import_genai.Type.STRING }
                },
                required: ["itemName", "suggestedPurchase", "benefit"]
              }
            },
            notes: { type: import_genai.Type.STRING }
          },
          required: ["recommendations"]
        }
      }
    });
    const jsonStr = response.text;
    res.json(JSON.parse(jsonStr || "{}"));
  } catch (err) {
    console.error("Gemini API execution error:", err);
    res.status(500).json({ error: "AI Optimization engine encountered an error" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
