import React from 'react';
import { ShoppingCart, Copy, Check, Sparkles, RefreshCw, AlertTriangle, Printer, Layers } from 'lucide-react';
import { InventoryItem, ShoppingListOptimization } from '../types';

interface ShoppingListCompilerProps {
  items: InventoryItem[];
  onOptimize: (items: InventoryItem[]) => Promise<ShoppingListOptimization | null>;
}

export default function ShoppingListCompiler({ items, onOptimize }: ShoppingListCompilerProps) {
  const [copiedList, setCopiedList] = React.useState(false);
  const [optimizing, setOptimizing] = React.useState(false);
  const [optimization, setOptimization] = React.useState<ShoppingListOptimization | null>(null);

  // Filter low stock items: currentStock <= minThreshold
  const lowStockItems = items.filter(item => item.currentStock <= item.minThreshold);

  const getReorderAmount = (item: InventoryItem) => {
    // Recommend replenishing to twice the threshold level or +10
    const deficit = Math.max(0, item.minThreshold - item.currentStock);
    const suggestedTarget = item.minThreshold * 2;
    return Math.max(deficit + 5, suggestedTarget - item.currentStock);
  };

  const handleCopyList = () => {
    if (lowStockItems.length === 0) return;

    let text = `=== TOKYO CLEANER PROCUREMENT LIST ===\n`;
    text += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    // Group by location
    const shibuyaLow = lowStockItems.filter(i => i.location === 'shibuya');
    const skytreeLow = lowStockItems.filter(i => i.location === 'skytree');

    if (shibuyaLow.length > 0) {
      text += `--- SHIBUYA OFFICE HUB ---\n`;
      shibuyaLow.forEach(item => {
        text += `- [ ] ${item.name}: Order ${getReorderAmount(item)} ${item.unit} (Current: ${item.currentStock}/${item.minThreshold})\n`;
      });
      text += `\n`;
    }

    if (skytreeLow.length > 0) {
      text += `--- JEFFREY SKYTREE HUB ---\n`;
      skytreeLow.forEach(item => {
        text += `- [ ] ${item.name}: Order ${getReorderAmount(item)} ${item.unit} (Current: ${item.currentStock}/${item.minThreshold})\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2000);
  };

  const handleAIRequest = async () => {
    if (lowStockItems.length === 0) return;
    setOptimizing(true);
    try {
      const result = await onOptimize(lowStockItems);
      if (result) {
        setOptimization(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="space-y-6" id="shopping-compiler-panel">
      {/* Overview Block */}
      <div className="bg-cream rounded-xl shadow-xs border border-sand-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-clay-600 font-mono uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-clay-500 inline-block animate-pulse"></span>
            Weekly procurement scan
          </div>
          <h3 className="font-display font-bold text-stone-800 text-2xl">Monthly Shopping List Compiler</h3>
          <p className="text-xs text-stone-500">Automatically aggregating materials below safety stocks across Shibuya & Skytree</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopyList}
            disabled={lowStockItems.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-sage-500 hover:bg-sage-600 disabled:bg-sand-200 text-cream disabled:text-stone-400 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            id="copy-shopping-list-btn"
          >
            {copiedList ? (
              <>
                <Check className="w-4 h-4 text-cream" />
                List Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Procurement List
              </>
            )}
          </button>
          
          <button
            onClick={() => window.print()}
            disabled={lowStockItems.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 border border-sand-200 hover:border-sand-300 disabled:border-sand-100 bg-cream hover:bg-sand-50 disabled:bg-sand-50 text-stone-700 disabled:text-stone-300 rounded-lg text-xs transition-colors cursor-pointer"
            id="print-shopping-list-btn"
          >
            <Printer className="w-4 h-4" />
            Print List
          </button>
        </div>
      </div>

      {lowStockItems.length === 0 ? (
        <div className="bg-cream rounded-xl border border-sand-200 p-12 text-center text-stone-500 space-y-3" id="no-depletions-notice">
          <Check className="w-10 h-10 text-sage-600 mx-auto" />
          <h4 className="font-display font-bold text-stone-800 text-lg">All Safety Stock Levels Healthy</h4>
          <p className="text-xs max-w-sm mx-auto leading-relaxed">
            There are currently no items under minimum safety thresholds in Shibuya Office or Jeffrey Skytree. No purchases are required.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main depletion list */}
          <div className="lg:col-span-7 bg-cream rounded-xl shadow-xs border border-sand-200 p-6 space-y-4">
            <h4 className="text-sm font-bold font-display text-stone-800 flex items-center gap-2 border-b border-sand-200 pb-2">
              <ShoppingCart className="w-4 h-4 text-stone-500" />
              Active Depletions ({lowStockItems.length})
            </h4>

            <div className="divide-y divide-sand-100 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {lowStockItems.map((item) => {
                const reorderQty = getReorderAmount(item);
                return (
                  <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="font-semibold text-stone-850 flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-semibold tracking-wide uppercase border ${
                          item.location === 'shibuya' 
                            ? 'bg-sage-50 text-sage-700 border-sage-100' 
                            : 'bg-sand-100 text-stone-700 border-sand-200'
                        }`}>
                          {item.location === 'shibuya' ? 'Shibuya' : 'Skytree'}
                        </span>
                      </div>
                      <div className="text-stone-400 font-mono text-[10px]">
                        Current: <span className="text-clay-600 font-bold">{item.currentStock}</span> / Threshold: {item.minThreshold} {item.unit}
                      </div>
                    </div>

                    <div className="bg-sand-50 border border-sand-200 px-3 py-1.5 rounded-lg text-right min-w-[100px]">
                      <span className="text-[10px] text-stone-400 block font-mono">Suggested Order</span>
                      <span className="font-bold text-stone-800 font-mono">+{reorderQty} {item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Optimizer Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-sage-900 to-sage-950 text-cream rounded-xl p-6 border border-sage-700 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-clay-300 font-mono text-xs uppercase font-bold">
                  <Sparkles className="w-4 h-4 text-clay-400 animate-pulse" />
                  Gemini Smart Procurement
                </div>
                <span className="text-[9px] bg-sage-950/40 text-sage-200 font-mono px-2 py-0.5 rounded border border-sage-900/50">
                  gemini-2.5-flash
                </span>
              </div>

              <h4 className="font-display font-bold text-xl text-cream">Bulk-Ordering Package Optimizer</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Send active safety stock depletion deficits to Gemini to compute recommended package sizes, alternative concentrates, or sustainable supply alternatives.
              </p>

              {optimizing ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-clay-300 animate-spin" />
                  <span className="text-xs text-stone-300 font-mono">Analyzing deficits & packaging catalogs...</span>
                </div>
              ) : optimization ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs scrollbar-thin border-t border-sage-900/50 pt-3">
                  {optimization.recommendations.map((rec, i) => (
                    <div key={i} className="p-2.5 bg-sage-950/40 border border-sage-900/50 rounded-lg space-y-1">
                      <div className="font-bold text-clay-200 font-sans">{rec.itemName}</div>
                      <div className="text-cream text-[11px] font-semibold flex items-center gap-1.5">
                        <span className="bg-clay-500/20 text-clay-300 px-1.5 py-0.5 rounded text-[9px] uppercase font-mono">Suggestion</span>
                        {rec.suggestedPurchase}
                      </div>
                      <div className="text-stone-300 text-[10px] leading-relaxed italic">
                        {rec.benefit}
                      </div>
                    </div>
                  ))}
                  {optimization.notes && (
                    <div className="p-2.5 bg-sage-950/20 rounded-lg text-[10px] text-stone-300 leading-relaxed border border-sage-900/20">
                      <strong>AI Procurement Note:</strong> {optimization.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-stone-400 text-xs flex flex-col items-center gap-2 bg-sage-950/20 border border-sage-900/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-clay-400" />
                  <span>Request package optimization tips for active depleted items.</span>
                </div>
              )}
            </div>

            <button
              onClick={handleAIRequest}
              disabled={optimizing}
              className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-clay-500 hover:bg-clay-650 disabled:bg-stone-800 text-cream font-semibold rounded-lg text-xs transition-all cursor-pointer shadow-md border border-clay-600"
              id="request-optimization-btn"
            >
              {optimizing ? (
                'Optimizing Procurement...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cream animate-pulse" />
                  Optimize Ordering with Gemini
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
