export interface InventoryItem {
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

export interface LogEntry {
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

export interface ShoppingListOptimization {
  recommendations: {
    itemName: string;
    suggestedPurchase: string;
    benefit: string;
  }[];
  notes?: string;
}
