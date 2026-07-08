import React from 'react';
import { 
  Building2, ClipboardList, QrCode, ShoppingCart, Clock, 
  BookOpen, Layers, Menu, X, Check, RefreshCw 
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import IntakeForm from './components/IntakeForm';
import QRGenerator from './components/QRGenerator';
import ShoppingListCompiler from './components/ShoppingListCompiler';
import StockHistory from './components/StockHistory';
import SOPGuides from './components/SOPGuides';
import { InventoryItem, LogEntry, ShoppingListOptimization } from './types';

export default function App() {
  const [activeView, setActiveView] = React.useState<'dashboard' | 'intake' | 'qr' | 'shopping' | 'history' | 'sop'>('dashboard');
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // QR pre-populate coordinates
  const [prefilledLocation, setPrefilledLocation] = React.useState<'shibuya' | 'skytree' | undefined>(undefined);
  const [prefilledItemName, setPrefilledItemName] = React.useState<string | undefined>(undefined);

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Compute live webhook URL
  React.useEffect(() => {
    // Dynamically derive coordinates if scanned from QR Code
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const locationParam = params.get('location');
      const itemParam = params.get('item');
      if (viewParam === 'intake') {
        setActiveView('intake');
        if (locationParam === 'shibuya' || locationParam === 'skytree') {
          setPrefilledLocation(locationParam as any);
        }
        if (itemParam) {
          setPrefilledItemName(itemParam);
        }
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [resInventory, resLogs] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/logs')
      ]);

      if (resInventory.ok && resLogs.ok) {
        const inventoryData = await resInventory.json();
        const logsData = await resLogs.json();
        setItems(inventoryData);
        setLogs(logsData);
      }
    } catch (err) {
      console.error('Failed to connect to backend api:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateThreshold = async (id: string, minThreshold: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/${id}/threshold`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minThreshold }),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Failed to update threshold:', err);
    }
    return false;
  };

  const handleManualAdjust = async (id: string, newStock: number, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/${id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStock, reason }),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    }
    return false;
  };

  const handleAddItem = async (payload: {
    name: string;
    category: string;
    location: 'shibuya' | 'skytree';
    currentStock: number;
    minThreshold: number;
    unit: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Failed to add item:', err);
    }
    return false;
  };

  const handleDeleteItem = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
    return false;
  };

  const handleForceReset = async (id: string, newStock: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/${id}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStock }),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Failed to force reset item:', err);
    }
    return false;
  };

  const handleLogSubmit = async (payload: {
    location: 'shibuya' | 'skytree';
    itemName: string;
    quantity: number;
    staffName: string;
    type: 'use' | 'delivery';
    notes?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/logs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          ...payload
        }),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error('Failed to log via form:', err);
    }
    return false;
  };

  const handleOptimizeProcurement = async (lowItems: InventoryItem[]): Promise<ShoppingListOptimization | null> => {
    try {
      const res = await fetch('/api/optimize-shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: lowItems }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('AI optimization failed:', err);
    }
    return null;
  };

  const handleSimulateQRScan = (location: 'shibuya' | 'skytree', itemName?: string) => {
    setPrefilledLocation(location);
    setPrefilledItemName(itemName);
    setActiveView('intake');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'intake', label: '10-Sec Intake Form', icon: ClipboardList },
    { id: 'qr', label: 'QR Sticker Codes', icon: QrCode },
    { id: 'shopping', label: 'Shopping List Compiler', icon: ShoppingCart },
    { id: 'history', label: 'Audit Trail & Trends', icon: Clock },
    { id: 'sop', label: 'Operations & SOP', icon: BookOpen },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
        <div className="bg-cream p-8 rounded-2xl border border-sand-200 shadow-sm text-center max-w-sm space-y-4">
          <RefreshCw className="w-10 h-10 text-sage-500 animate-spin mx-auto" />
          <h2 className="font-display font-bold text-2xl text-stone-800">Initializing Tokyo Cleaner...</h2>
          <p className="text-xs text-stone-400">Loading stock configurations, safety threshold databases, and audit logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col antialiased text-stone-700" id="tokyo-cleaner-app">
      {/* Top Banner Navigation Bar */}
      <header className="bg-sand-100 text-stone-800 border-b border-sand-200 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-500 flex items-center justify-center border border-sage-600 shadow-sm">
                <Building2 className="w-5 h-5 text-cream" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl leading-none tracking-tight text-sage-700">東京 CLEANER</h1>
                <p className="text-[10px] text-stone-400 font-mono tracking-wider uppercase mt-1">Inventory Management System</p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex space-x-1">
              {navigationItems.map((nav) => {
                const Icon = nav.icon;
                const isActive = activeView === nav.id;
                return (
                  <button
                    key={nav.id}
                    onClick={() => {
                      setActiveView(nav.id);
                      if (nav.id !== 'intake') {
                        // Clear prefill caches when navigating away
                        setPrefilledLocation(undefined);
                        setPrefilledItemName(undefined);
                      }
                    }}
                    className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-sage-500 text-cream font-bold shadow-xs' 
                        : 'text-stone-600 hover:text-stone-800 hover:bg-sand-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-stone-500" />
                    {nav.label}
                  </button>
                );
              })}
            </nav>

            {/* Live Indicator Refresh */}
            <div className="hidden lg:flex items-center gap-3">
              <button 
                onClick={fetchData}
                disabled={refreshing}
                className="p-2 bg-sand-200 hover:bg-sand-300 text-stone-600 hover:text-stone-800 rounded-lg transition-colors cursor-pointer border border-sand-300"
                title="Force refresh database"
                id="refresh-all-btn"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-sage-100 border border-sage-200 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-ping"></span>
                <span className="text-[9px] font-mono font-semibold text-sage-700 uppercase tracking-wider">Standalone Database Active</span>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="p-2 text-stone-600 hover:text-stone-800 rounded-lg transition-colors cursor-pointer"
                id="mobile-refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-stone-600 hover:text-stone-800 rounded-lg transition-colors cursor-pointer"
                id="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-sand-100 border-t border-sand-200 px-4 pt-2 pb-4 space-y-1">
            {navigationItems.map((nav) => {
              const Icon = nav.icon;
              const isActive = activeView === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => {
                    setActiveView(nav.id);
                    setMobileMenuOpen(false);
                    if (nav.id !== 'intake') {
                      setPrefilledLocation(undefined);
                      setPrefilledItemName(undefined);
                    }
                  }}
                  className={`flex items-center gap-3 w-full py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-sage-500 text-cream font-bold' 
                      : 'text-stone-600 hover:text-stone-800 hover:bg-sand-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {nav.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Responsive Body Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <Dashboard
              items={items}
              logs={logs}
              onUpdateThreshold={handleUpdateThreshold}
              onManualAdjust={handleManualAdjust}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onForceReset={handleForceReset}
            />
          </div>
        )}

        {activeView === 'intake' && (
          <div className="py-4">
            <IntakeForm
              items={items}
              prefilledLocation={prefilledLocation}
              prefilledItemName={prefilledItemName}
              onLogSubmit={handleLogSubmit}
              onBackToDashboard={() => {
                setActiveView('dashboard');
                setPrefilledLocation(undefined);
                setPrefilledItemName(undefined);
              }}
            />
          </div>
        )}

        {activeView === 'qr' && (
          <QRGenerator
            items={items}
            onSimulateScan={handleSimulateQRScan}
          />
        )}

        {activeView === 'shopping' && (
          <ShoppingListCompiler
            items={items}
            onOptimize={handleOptimizeProcurement}
          />
        )}

        {activeView === 'history' && (
          <div className="space-y-8">
            <StockHistory
              logs={logs}
              onRefresh={fetchData}
            />
          </div>
        )}

        {activeView === 'sop' && (
          <SOPGuides />
        )}
      </main>
    </div>
  );
}

// Application entry point ends here

