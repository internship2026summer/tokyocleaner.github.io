import React from 'react';
import { Send, Terminal, Link, Check, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { LogEntry } from '../types';

interface WebhookSetupProps {
  webhookUrl: string;
  logs: LogEntry[];
  onRefresh: () => void;
  onSimulateWebhook: (payload: any) => Promise<boolean>;
}

export default function WebhookSetup({ webhookUrl, logs, onRefresh, onSimulateWebhook }: WebhookSetupProps) {
  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const [staffName, setStaffName] = React.useState('Yuto Sato');
  const [location, setLocation] = React.useState<'shibuya' | 'skytree'>('shibuya');
  const [itemName, setItemName] = React.useState('Eco-Cleaner All-Purpose Spray');
  const [quantity, setQuantity] = React.useState(2);
  const [notes, setNotes] = React.useState('Regular routine floor sweep');
  const [simulating, setSimulating] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');

  const webhookLogs = logs.filter(log => log.source === 'google_form');

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setSuccessMsg('');

    const payload = {
      timestamp: new Date().toISOString(),
      staffName,
      location,
      itemName,
      quantity: Number(quantity),
      type: 'use',
      notes
    };

    const success = await onSimulateWebhook(payload);
    setSimulating(false);
    if (success) {
      setSuccessMsg('Successfully pushed mock Google Form response to webhook!');
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  return (
    <div className="space-y-6" id="webhook-setup-panel">
      {/* Configuration Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6">
        <h3 className="font-sans font-semibold text-slate-900 text-lg mb-2">Live Webhook Endpoint</h3>
        <p className="text-sm text-slate-500 mb-6">
          This URL receives `onFormSubmit` JSON payloads forwarded by Google Sheets. The server automatically matches materials and updates safety stocks.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 overflow-x-auto">
            <Link className="w-4 h-4 text-slate-400 flex-none" />
            <span className="select-all whitespace-nowrap">{webhookUrl}</span>
          </div>
          <button
            onClick={handleCopyUrl}
            className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex-none"
            id="copy-webhook-url-btn"
          >
            {copiedUrl ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Copied!
              </>
            ) : (
              'Copy URL'
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulator Panel */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="font-sans font-semibold text-slate-900 text-md">Google Form Response Simulator</h3>
            </div>
            
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Submit a sample submission below to simulate what occurs when a cleaner scans a QR code and logs stock using their phone. This calls the actual `/api/webhook/google-form` endpoint.
            </p>

            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">Staff Name</label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">Hub Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="shibuya">Shibuya Office</option>
                    <option value="skytree">Jeffrey Skytree</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">Cleaning Item</label>
                  <select
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {location === 'shibuya' ? (
                      <>
                        <option value="Eco-Cleaner All-Purpose Spray">Eco-Cleaner Spray</option>
                        <option value="Microfiber Cloths (Blue)">Microfiber Cloths (Blue)</option>
                        <option value="Heavy Duty Trash Bags (45L)">Heavy Duty Trash Bags</option>
                        <option value="Toilet Cleaner Gel">Toilet Cleaner Gel</option>
                        <option value="Floor Mopping Concentrate">Floor Mopping Concentrate</option>
                      </>
                    ) : (
                      <>
                        <option value="Custom Luxury Linens Set">Custom Luxury Linens Set</option>
                        <option value="Organic Amenity Shampoo">Organic Amenity Shampoo</option>
                        <option value="Organic Amenity Conditioner">Organic Amenity Conditioner</option>
                        <option value="Premium Microfiber Mop Pads">Premium Microfiber Mop Pads</option>
                        <option value="Airbnb Welcome Cards">Airbnb Welcome Cards</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">Quantity Used</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 font-sans">Activity Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Evening floor cleaning complete"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-100 flex items-start gap-2 animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-none" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={simulating}
                className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                id="simulate-webhook-btn"
              >
                {simulating ? (
                  'Pushing Payload...'
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Simulate Google Form Submit
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Console Panel */}
        <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 flex flex-col justify-between h-full min-h-[400px]">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h3 className="font-sans font-semibold text-sm text-white font-mono">Webhook Receiver Console</h3>
              </div>
              <button
                onClick={onRefresh}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Refresh logs"
                id="refresh-console-btn"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {webhookLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-3">
                <AlertCircle className="w-8 h-8 text-slate-600" />
                <p className="text-xs font-mono">No incoming Google Form submissions registered yet.</p>
                <p className="text-[10px] text-slate-600 max-w-xs">Use the left simulator or set up the real Google Sheet connection to feed live data here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 text-xs scrollbar-thin">
                {webhookLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg font-mono space-y-1.5 text-[11px] hover:border-slate-700 transition-colors">
                    <div className="flex justify-between text-slate-400">
                      <span className="text-indigo-400">POST /api/webhook/google-form</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-emerald-400 font-semibold">
                      {"{ status: \"success\", item_updated: \"" + log.itemName + "\" }"}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-slate-400 mt-1 pt-1 border-t border-slate-800/50">
                      <div>Location: <span className="text-white">{log.location === 'shibuya' ? 'Shibuya Office' : 'Skytree'}</span></div>
                      <div>Quantity: <span className="text-white">-{log.quantity}</span></div>
                      <div>Staff: <span className="text-white">{log.staffName}</span></div>
                      <div>Notes: <span className="text-white truncate block max-w-[120px]">{log.notes || 'N/A'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between items-center">
            <span>Buffer: 100 entries max</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              Listening on Port 3000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
