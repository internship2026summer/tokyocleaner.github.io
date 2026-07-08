import React from 'react';
import { Check, ClipboardList, Smartphone, ArrowLeft, RefreshCw, Layers, Plus, Minus, UserCheck } from 'lucide-react';
import { InventoryItem } from '../types';

interface IntakeFormProps {
  items: InventoryItem[];
  prefilledLocation?: 'shibuya' | 'skytree';
  prefilledItemName?: string;
  onLogSubmit: (payload: {
    location: 'shibuya' | 'skytree';
    itemName: string;
    quantity: number;
    staffName: string;
    type: 'use' | 'delivery';
    notes?: string;
  }) => Promise<boolean>;
  onBackToDashboard?: () => void;
}

export default function IntakeForm({
  items,
  prefilledLocation,
  prefilledItemName,
  onLogSubmit,
  onBackToDashboard,
}: IntakeFormProps) {
  const [location, setLocation] = React.useState<'shibuya' | 'skytree'>(prefilledLocation || 'shibuya');
  const [itemName, setItemName] = React.useState<string>(prefilledItemName || '');
  const [quantity, setQuantity] = React.useState<number>(1);
  const [notes, setNotes] = React.useState<string>('');
  const [logType, setLogType] = React.useState<'use' | 'delivery'>('use');
  const [submitting, setSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Sync state if pre-populated props change
  React.useEffect(() => {
    if (prefilledLocation) setLocation(prefilledLocation);
  }, [prefilledLocation]);

  React.useEffect(() => {
    if (prefilledItemName) {
      setItemName(prefilledItemName);
    } else {
      // Set first available item as default
      const availableItems = items.filter(i => i.location === location);
      if (availableItems.length > 0 && !availableItems.some(i => i.name === itemName)) {
        setItemName(availableItems[0].name);
      }
    }
  }, [prefilledItemName, location, items]);

  const filteredItems = items.filter(item => item.location === location);

  // Quick select quantities
  const quickQuantities = [1, 2, 5, 10];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;
    setSubmitting(true);

    const success = await onLogSubmit({
      location,
      itemName,
      quantity,
      staffName: 'Staff Member',
      type: logType,
      notes: notes || (logType === 'use' ? 'Staff shift usage' : 'Supplier delivery restock'),
    });

    setSubmitting(false);
    if (success) {
      setShowSuccess(true);
      // Reset form but keep location
      setQuantity(1);
      setNotes('');
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-cream text-stone-700 rounded-3xl overflow-hidden border border-sand-300 shadow-xl relative" id="mobile-intake-form-frame">
      {/* Phone Header / Status Bar */}
      <div className="bg-sand-100 px-6 py-3 flex justify-between items-center text-[10px] font-mono text-stone-500 border-b border-sand-200">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse"></span>
          TOKYO CLEANER MOBILE
        </span>
        <span className="bg-sage-100 px-2 py-0.5 rounded-sm text-[9px] text-sage-800">10-Sec Rule Active</span>
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div className="p-6 space-y-6">
        {/* Navigation back (if we came from Dashboard) */}
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            id="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Manager Dashboard
          </button>
        )}

        {/* Title area */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-sage-50 text-sage-600 rounded-full mb-2 border border-sage-100">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl text-stone-800">Log Supply Material</h2>
          <p className="text-xs text-stone-400">Zero complexity. Fill & tap in 10 seconds.</p>
        </div>

        {showSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in" id="success-screen">
            <div className="w-16 h-16 rounded-full bg-sage-50 border border-sage-200 text-sage-600 flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-stone-800">Entry Submitted Successfully</h3>
              <p className="text-xs text-sage-600 mt-1 font-mono">Synced with Management Dashboard</p>
            </div>
            <p className="text-xs text-stone-500 max-w-xs pt-2">
              Values sent! Ready for the next supply item.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-4 px-4 py-1.5 bg-sand-200 hover:bg-sand-300 text-xs font-semibold text-stone-700 rounded-lg transition-colors cursor-pointer border border-sand-300"
              id="log-another-item-btn"
            >
              Log Another Item
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Log Type Switch (Use vs Delivery) */}
            <div className="grid grid-cols-2 gap-2 bg-sand-50 p-1 rounded-xl border border-sand-200">
              <button
                type="button"
                onClick={() => setLogType('use')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  logType === 'use'
                    ? 'bg-clay-500/25 text-clay-700 border border-clay-500/30 shadow-xs'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
                id="log-type-use-btn"
              >
                Use (- Negative)
              </button>
              <button
                type="button"
                onClick={() => setLogType('delivery')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  logType === 'delivery'
                    ? 'bg-sage-500/25 text-sage-700 border border-sage-500/30 shadow-xs'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
                id="log-type-delivery-btn"
              >
                Delivery (+ Restock)
              </button>
            </div>

            {/* Step 1: Location selection */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 font-sans">
                1. Location Hub
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLocation('shibuya');
                    setItemName('');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                    location === 'shibuya'
                      ? 'border-sage-500 bg-sage-50 text-sage-700 font-bold'
                      : 'border-sand-200 bg-sand-50 hover:bg-sand-100 text-stone-500'
                  }`}
                  id="intake-shibuya-btn"
                >
                  Shibuya Office
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocation('skytree');
                    setItemName('');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                    location === 'skytree'
                      ? 'border-sage-500 bg-sage-50 text-sage-700 font-bold'
                      : 'border-sand-200 bg-sand-50 hover:bg-sand-100 text-stone-500'
                  }`}
                  id="intake-skytree-btn"
                >
                  Jeffrey Skytree
                </button>
              </div>
            </div>

            {/* Step 2: Material selection */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 font-sans">
                2. Supply Item
              </label>
              <select
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
                required
              >
                <option value="" disabled>-- Choose Supply --</option>
                {filteredItems.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name} ({item.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Quantities (Big Touch Targets) */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 font-sans flex justify-between">
                <span>3. Quantity</span>
                <span className="text-sage-600 font-mono">
                  {itemName && items.find(i => i.name === itemName)?.unit}
                </span>
              </label>

              <div className="flex items-center justify-between gap-4 bg-sand-50 border border-sand-200 rounded-2xl p-2 mb-3">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 bg-cream hover:bg-sand-100 border border-sand-200 hover:border-sand-300 active:scale-95 rounded-xl flex items-center justify-center text-stone-700 cursor-pointer"
                  id="dec-qty-btn"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold font-mono text-stone-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-12 bg-cream hover:bg-sand-100 border border-sand-200 hover:border-sand-300 active:scale-95 rounded-xl flex items-center justify-center text-stone-700 cursor-pointer"
                  id="inc-qty-btn"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Quick selectors */}
              <div className="grid grid-cols-4 gap-2">
                {quickQuantities.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuantity(val)}
                    className={`py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer border ${
                      quantity === val
                        ? 'bg-sage-500 text-cream font-bold border-sage-600 shadow-xs'
                        : 'bg-sand-50 border-sand-200 text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra notes */}
            <div>
              <input
                type="text"
                placeholder="Add optional comment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-sand-50 border border-sand-200 rounded-xl px-4 py-3 text-xs text-stone-600 focus:ring-1 focus:ring-sage-500 focus:outline-hidden"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting || !itemName}
              className={`w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                logType === 'use'
                  ? 'bg-clay-500 hover:bg-clay-600 disabled:bg-sand-200 text-cream'
                  : 'bg-sage-500 hover:bg-sage-600 disabled:bg-sand-200 text-cream'
              }`}
              id="submit-log-btn"
            >
              {submitting ? (
                'Logging Stock Entry...'
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {logType === 'use' ? 'TAP TO LOG USAGE' : 'TAP TO LOG DELIVERY'}
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer Branding */}
      <div className="bg-sand-100 py-4 px-6 text-center text-[9px] text-stone-500 font-mono border-t border-sand-200">
        POWERED BY TOKYO CLEANER NATIVE STOCK ENGINE
      </div>
    </div>
  );
}
