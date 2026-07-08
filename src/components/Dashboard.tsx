import React from 'react';
import { InventoryItem, LogEntry } from '../types';
import { 
  Building2, Search, Filter, AlertTriangle, CheckCircle2, ChevronRight, Edit2, 
  Settings, ShoppingBag, Plus, Minus, Check, X, ShieldAlert 
} from 'lucide-react';

interface DashboardProps {
  items: InventoryItem[];
  logs: LogEntry[];
  onUpdateThreshold: (id: string, threshold: number) => Promise<boolean>;
  onManualAdjust: (id: string, newStock: number, reason: string) => Promise<boolean>;
  onAddItem: (payload: {
    name: string;
    category: string;
    location: 'shibuya' | 'skytree';
    currentStock: number;
    minThreshold: number;
    unit: string;
  }) => Promise<boolean>;
  onDeleteItem: (id: string) => Promise<boolean>;
  onForceReset: (id: string, newStock: number) => Promise<boolean>;
}

export default function Dashboard({ 
  items, 
  logs, 
  onUpdateThreshold, 
  onManualAdjust, 
  onAddItem, 
  onDeleteItem, 
  onForceReset 
}: DashboardProps) {
  const [activeTab, setActiveTab] = React.useState<'all' | 'shibuya' | 'skytree'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'low' | 'healthy'>('all');

  // Editing / Configuration state
  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(null);
  const [editThreshold, setEditThreshold] = React.useState<number>(5);
  const [editStock, setEditStock] = React.useState<number>(10);
  const [adjustReason, setAdjustReason] = React.useState<string>('Periodic physical cycle-count audit');
  const [submittingEdit, setSubmittingEdit] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  // Adding Item State
  const [addingItem, setAddingItem] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState('');
  const [newItemCategory, setNewItemCategory] = React.useState('Sprays & Cleaners');
  const [newItemLocation, setNewItemLocation] = React.useState<'shibuya' | 'skytree'>('shibuya');
  const [newItemStock, setNewItemStock] = React.useState<number>(10);
  const [newItemThreshold, setNewItemThreshold] = React.useState<number>(5);
  const [newItemUnit, setNewItemUnit] = React.useState('bottles');
  const [submittingAdd, setSubmittingAdd] = React.useState(false);

  // Derive high-level KPI metrics
  const totalItemsCount = items.length;
  const lowStockItems = items.filter(item => item.currentStock <= item.minThreshold);
  const alarmsCount = lowStockItems.length;
  const totalDeliveries = logs.filter(log => log.type === 'delivery').reduce((acc, log) => acc + log.quantity, 0);
  const totalUses = logs.filter(log => log.type === 'use').reduce((acc, log) => acc + log.quantity, 0);

  // Extract unique categories for filter
  const categories = Array.from(new Set(items.map(item => item.category)));

  // Filter items matching tab, search, category, status
  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'all' || item.location === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const isLow = item.currentStock <= item.minThreshold;
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'low' && isLow) || 
                          (filterStatus === 'healthy' && !isLow);
    return matchesTab && matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setEditThreshold(item.minThreshold);
    setEditStock(item.currentStock);
    setAdjustReason('Annual stock correction audit');
    setConfirmDelete(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSubmittingEdit(true);

    try {
      // 1. Update safety threshold if changed
      if (editThreshold !== editingItem.minThreshold) {
        await onUpdateThreshold(editingItem.id, editThreshold);
      }
      
      // 2. Perform manual stock correction if adjusted
      if (editStock !== editingItem.currentStock) {
        await onManualAdjust(editingItem.id, editStock, adjustReason);
      }

      setEditingItem(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingItem) return;
    setSubmittingEdit(true);
    try {
      const ok = await onDeleteItem(editingItem.id);
      if (ok) {
        setEditingItem(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingEdit(false);
      setConfirmDelete(false);
    }
  };

  const handleForceResetClick = async () => {
    if (!editingItem) return;
    const ok = window.confirm(`Are you absolutely sure you want to FORCE RESET ${editingItem.name}? This will instantly set current stock to ${editStock} AND completely reset historical usage and delivery metrics for this item.`);
    if (!ok) return;
    
    setSubmittingEdit(true);
    try {
      const success = await onForceReset(editingItem.id, editStock);
      if (success) {
        setEditingItem(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setSubmittingAdd(true);
    try {
      const ok = await onAddItem({
        name: newItemName.trim(),
        category: newItemCategory,
        location: newItemLocation,
        currentStock: newItemStock,
        minThreshold: newItemThreshold,
        unit: newItemUnit
      });
      if (ok) {
        // Reset state
        setNewItemName('');
        setNewItemStock(10);
        setNewItemThreshold(5);
        setNewItemUnit('bottles');
        setAddingItem(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAdd(false);
    }
  };

  return (
    <div className="space-y-6" id="management-dashboard-view">
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-metric-strip">
        <div className="bg-cream p-5 rounded-xl shadow-xs border border-sand-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Stock Level Alarms</span>
            <div className="text-2xl font-bold font-mono text-stone-800 flex items-center gap-1.5">
              <span className={alarmsCount > 0 ? 'text-clay-600' : 'text-sage-600'}>
                {alarmsCount}
              </span>
              {alarmsCount > 0 && (
                <span className="text-[10px] bg-clay-50 text-clay-700 border border-clay-100 font-semibold px-1.5 py-0.5 rounded uppercase font-mono animate-pulse">
                  Alarms
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg flex-none ${alarmsCount > 0 ? 'bg-clay-50 text-clay-500' : 'bg-sage-50 text-sage-500'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-cream p-5 rounded-xl shadow-xs border border-sand-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Monitored Materials</span>
            <div className="text-2xl font-bold font-mono text-stone-800">{totalItemsCount}</div>
          </div>
          <div className="p-3 bg-sand-100 text-sage-600 rounded-lg flex-none border border-sand-200">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-cream p-5 rounded-xl shadow-xs border border-sand-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Total Logged Uses</span>
            <div className="text-2xl font-bold font-mono text-stone-700">{totalUses} u</div>
          </div>
          <div className="p-3 bg-sand-100 text-stone-500 rounded-lg flex-none border border-sand-200">
            <Plus className="w-5 h-5 text-clay-500 rotate-45" />
          </div>
        </div>

        <div className="bg-cream p-5 rounded-xl shadow-xs border border-sand-200 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Monthly Deliveries</span>
            <div className="text-2xl font-bold font-mono text-sage-600">{totalDeliveries} u</div>
          </div>
          <div className="p-3 bg-sage-50 text-sage-500 rounded-lg flex-none border border-sage-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid Toggles & Controls */}
      <div className="bg-cream rounded-xl shadow-xs border border-sand-200 p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Hub Tabs */}
        <div className="flex gap-1.5 bg-sand-50 border border-sand-200 rounded-lg p-1 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 lg:flex-none py-1.5 px-4 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-cream text-stone-800 font-bold shadow-xs' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setActiveTab('shibuya')}
            className={`flex-1 lg:flex-none py-1.5 px-4 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'shibuya' ? 'bg-cream text-stone-800 font-bold shadow-xs' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Shibuya Office
          </button>
          <button
            onClick={() => setActiveTab('skytree')}
            className={`flex-1 lg:flex-none py-1.5 px-4 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'skytree' ? 'bg-cream text-stone-800 font-bold shadow-xs' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Jeffrey Skytree
          </button>
        </div>

        {/* Dynamic Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-sand-50 border border-sand-200 rounded-lg focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-stone-400 flex-none" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs bg-sand-50 border border-sand-200 rounded-lg p-2 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-stone-400 flex-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full text-xs bg-sand-50 border border-sand-200 rounded-lg p-2 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
            >
              <option value="all">All Alarms</option>
              <option value="low">Under Safety Limit</option>
              <option value="healthy">Healthy Levels</option>
            </select>
          </div>

          {/* Add Supply Item Button */}
          <button
            onClick={() => setAddingItem(true)}
            className="flex items-center justify-center gap-1.5 bg-sage-500 hover:bg-sage-600 text-cream font-bold py-2 px-3.5 rounded-lg text-xs cursor-pointer shadow-xs transition-colors"
            id="add-item-trigger-btn"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Supply</span>
          </button>
        </div>
      </div>

      {/* Side-by-side Stock Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="stock-deck-grid">
        {filteredItems.map((item) => {
          const isLow = item.currentStock <= item.minThreshold;
          
          return (
            <div 
              key={item.id} 
              className={`bg-cream rounded-xl shadow-xs border p-5 flex flex-col justify-between hover:shadow-sm transition-all duration-300 ${
                isLow ? 'border-clay-200 bg-clay-50/10' : 'border-sand-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-[10px] font-mono text-stone-400 tracking-wider font-semibold uppercase">{item.category}</span>
                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-semibold tracking-wide uppercase ${
                    item.location === 'shibuya' 
                      ? 'bg-sage-50 text-sage-700 border border-sage-200' 
                      : 'bg-clay-50 text-clay-700 border border-clay-200'
                  }`}>
                    {item.location === 'shibuya' ? 'Shibuya Office' : 'Jeffrey Skytree'}
                  </span>
                </div>

                <h3 className="font-display font-bold text-stone-800 text-lg mb-3 truncate" title={item.name}>
                  {item.name}
                </h3>

                {/* Stock progress meters */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-stone-500">Stock Count</span>
                    <div className="text-right font-mono">
                      <span className={`text-lg font-bold ${isLow ? 'text-clay-600' : 'text-stone-800'}`}>
                        {item.currentStock}
                      </span>
                      <span className="text-xs text-stone-400"> / {item.minThreshold} {item.unit}</span>
                    </div>
                  </div>

                  {/* High contrast progress bar */}
                  <div className="w-full bg-sand-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${Math.min(100, (item.currentStock / (item.minThreshold * 2 || 10)) * 100)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-clay-500' : 'bg-sage-500'}`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-sand-200 text-xs">
                {isLow ? (
                  <span className="flex items-center gap-1 text-clay-600 font-semibold text-[10px] font-mono tracking-wider uppercase animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Low Stock Limit
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sage-600 font-semibold text-[10px] font-mono tracking-wider uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Stock Healthy
                  </span>
                )}

                <button
                  onClick={() => handleEditClick(item)}
                  className="flex items-center gap-1 text-sage-600 hover:text-sage-800 hover:bg-sage-100 font-semibold py-1 px-2.5 bg-sand-50 rounded-lg transition-colors cursor-pointer text-[10px] font-mono border border-sand-200"
                  id={`edit-item-${item.id}`}
                >
                  <Edit2 className="w-3 h-3" />
                  Configure
                </button>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-16 text-center text-stone-400 font-mono text-xs bg-stone-50 rounded-xl border border-sand-200" id="no-materials-match">
            No monitored materials matched these search coordinates.
          </div>
        )}
      </div>

      {/* Adjust & safety threshold editor modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="edit-threshold-modal">
          <div className="bg-cream rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-sand-200">
            {/* Header */}
            <div className="bg-sage-700 text-cream p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-sage-200 uppercase font-semibold tracking-wider">{editingItem.location === 'shibuya' ? 'Shibuya Office' : 'Jeffrey Skytree'}</span>
                <h3 className="font-display font-bold text-xl text-cream mt-0.5">{editingItem.name}</h3>
              </div>
              <button 
                onClick={() => setEditingItem(null)} 
                className="p-1 text-sage-200 hover:text-cream hover:bg-sage-800 rounded-lg transition-colors cursor-pointer"
                id="close-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-5 text-xs text-stone-600">
              {/* Threshold parameter */}
              <div>
                <label className="block font-semibold text-stone-700 mb-2">Safety Stock Threshold ({editingItem.unit})</label>
                <div className="flex items-center justify-between gap-4 bg-sand-50 border border-sand-200 rounded-xl p-2">
                  <button
                    type="button"
                    onClick={() => setEditThreshold(t => Math.max(0, t - 1))}
                    className="w-10 h-10 bg-cream border border-sand-200 hover:bg-sand-50 active:scale-95 rounded-lg flex items-center justify-center text-stone-700 cursor-pointer"
                    id="dec-threshold-btn"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold font-mono text-stone-800">{editThreshold}</span>
                  <button
                    type="button"
                    onClick={() => setEditThreshold(t => t + 1)}
                    className="w-10 h-10 bg-cream border border-sand-200 hover:bg-sand-50 active:scale-95 rounded-lg flex items-center justify-center text-stone-700 cursor-pointer"
                    id="inc-threshold-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] text-stone-400 mt-1 block">When active stock falls below or equal to this limit, a stock alarm triggers.</span>
              </div>

              {/* Physical Audit Stock Adjustment */}
              <div>
                <label className="block font-semibold text-stone-700 mb-2">Manual Physical Count Corrective (Physical count adjustment)</label>
                <div className="flex items-center justify-between gap-4 bg-sand-50 border border-sand-200 rounded-xl p-2">
                  <button
                    type="button"
                    onClick={() => setEditStock(s => Math.max(0, s - 1))}
                    className="w-10 h-10 bg-cream border border-sand-200 hover:bg-sand-50 active:scale-95 rounded-lg flex items-center justify-center text-stone-700 cursor-pointer"
                    id="dec-stock-btn"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-bold font-mono text-stone-800">{editStock}</span>
                  <button
                    type="button"
                    onClick={() => setEditStock(s => s + 1)}
                    className="w-10 h-10 bg-cream border border-sand-200 hover:bg-sand-50 active:scale-95 rounded-lg flex items-center justify-center text-stone-700 cursor-pointer"
                    id="inc-stock-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Adjustment Reason */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Adjustment Audit Notes</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g., Physical shelf count cycle count correction"
                  className="w-full text-xs bg-cream border border-sand-200 rounded-lg p-2.5 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
                  required
                />
              </div>

              {/* Force Reset Section */}
              <div className="bg-sand-50 rounded-xl p-4 border border-sand-200/60 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-stone-800 text-[11px] uppercase tracking-wider font-mono">Force Reset Metrics</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">Resets stock and clears usage/delivery counters immediately.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleForceResetClick}
                    className="py-1.5 px-3 bg-stone-250 hover:bg-stone-300 active:scale-95 text-stone-700 font-bold rounded-lg transition-colors cursor-pointer text-[10px]"
                    id="force-reset-btn"
                  >
                    Force Reset
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-sand-200">
                {confirmDelete ? (
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="py-2 px-3.5 bg-clay-600 hover:bg-clay-700 text-cream font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 animate-pulse"
                    id="confirm-delete-btn"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Confirm Delete
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="py-2 px-3 border border-clay-200 text-clay-600 hover:bg-clay-50 font-semibold rounded-lg text-xs cursor-pointer"
                    id="delete-item-btn"
                  >
                    Delete Item
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="py-2 px-4 border border-sand-200 hover:bg-sand-50 font-semibold rounded-lg text-stone-700 cursor-pointer"
                    id="cancel-edit-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEdit}
                    className="py-2 px-5 bg-sage-500 hover:bg-sage-600 text-cream font-semibold rounded-lg cursor-pointer transition-colors"
                    id="save-edit-btn"
                  >
                    {submittingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supply Item Modal */}
      {addingItem && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="add-item-modal">
          <div className="bg-cream rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-sand-200">
            {/* Header */}
            <div className="bg-sage-700 text-cream p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-sage-200 uppercase font-semibold tracking-wider">Management Control</span>
                <h3 className="font-display font-bold text-xl text-cream mt-0.5">Add Supply Item</h3>
              </div>
              <button 
                onClick={() => setAddingItem(false)} 
                className="p-1 text-sage-200 hover:text-cream hover:bg-sage-800 rounded-lg transition-colors cursor-pointer"
                id="close-add-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddItemSubmit} className="p-6 space-y-4 text-xs text-stone-600">
              {/* Name */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Organic Amenity Shampoo"
                  className="w-full text-xs bg-cream border border-sand-200 rounded-lg p-2.5 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
                  required
                />
              </div>

              {/* Grid Category & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full text-xs bg-cream border border-sand-200 rounded-lg p-2.5 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
                  >
                    <option value="Sprays & Cleaners">Sprays & Cleaners</option>
                    <option value="Paper & Linens">Paper & Linens</option>
                    <option value="Amenities & Soaps">Amenities & Soaps</option>
                    <option value="Microfibers & Pads">Microfibers & Pads</option>
                    <option value="Trash Bags & Bags">Trash Bags & Bags</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Hub Location</label>
                  <select
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value as any)}
                    className="w-full text-xs bg-cream border border-sand-200 rounded-lg p-2.5 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
                  >
                    <option value="shibuya">Shibuya Office</option>
                    <option value="skytree">Jeffrey Skytree</option>
                  </select>
                </div>
              </div>

              {/* Grid Stock & Threshold */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full text-xs bg-cream border border-sand-200 rounded-lg p-2.5 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Safety Limit (Min)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(Number(e.target.value))}
                    className="w-full text-xs bg-cream border border-sand-200 rounded-lg p-2.5 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
                    required
                  />
                </div>
              </div>

              {/* Unit of Measurement */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Unit of Measurement</label>
                <input
                  type="text"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  placeholder="e.g., bottles, packs, rolls"
                  className="w-full text-xs bg-cream border border-sand-200 rounded-lg p-2.5 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
                  required
                />
              </div>

              {/* CTA Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setAddingItem(false)}
                  className="py-2 px-4 border border-sand-200 hover:bg-sand-50 font-semibold rounded-lg text-stone-700 cursor-pointer"
                  id="cancel-add-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="py-2 px-5 bg-sage-500 hover:bg-sage-600 text-cream font-semibold rounded-lg cursor-pointer transition-colors"
                  id="save-add-btn"
                >
                  {submittingAdd ? 'Adding...' : 'Add Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
