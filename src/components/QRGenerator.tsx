import React from 'react';
import { QrCode, Download, Printer, ExternalLink, Smartphone, Info, RefreshCw } from 'lucide-react';
import { InventoryItem } from '../types';
import QRCode from 'qrcode';

interface QRGeneratorProps {
  items: InventoryItem[];
  onSimulateScan: (location: 'shibuya' | 'skytree', itemName?: string) => void;
}

export default function QRGenerator({ items, onSimulateScan }: QRGeneratorProps) {
  const [selectedLocation, setSelectedLocation] = React.useState<'shibuya' | 'skytree'>('shibuya');
  const [selectedItem, setSelectedItem] = React.useState<string>('all');
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('');

  // Filter items matching the selected location
  const filteredItems = items.filter(item => item.location === selectedLocation);

  const activeItem = items.find(item => item.id === selectedItem);

  const getQRLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tokyocleaner.example.com';
    let url = `${origin}/?view=intake&location=${selectedLocation}`;
    if (selectedItem !== 'all' && activeItem) {
      url += `&item=${encodeURIComponent(activeItem.name)}`;
    }
    return url;
  };

  React.useEffect(() => {
    let active = true;
    const generateQR = async () => {
      try {
        const link = getQRLink();
        const url = await QRCode.toDataURL(link, {
          width: 384,
          margin: 1,
          color: {
            dark: '#262c20', // deep forest matching our eco-friendly theme
            light: '#fcfbf7' // soft warm off-white matching the theme
          }
        });
        if (active) {
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    };
    generateQR();
    return () => {
      active = false;
    };
  }, [selectedLocation, selectedItem, items]);

  const handleSimulateScan = () => {
    onSimulateScan(
      selectedLocation,
      selectedItem !== 'all' && activeItem ? activeItem.name : undefined
    );
  };

  return (
    <div className="space-y-6" id="qr-generator-panel">
      <div className="bg-cream rounded-xl shadow-xs border border-sand-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-sage-50 text-sage-600 rounded-lg">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-stone-800 text-xl">Intelligent QR Sticker Generator</h3>
            <p className="text-xs text-stone-400 font-mono">Pre-fill Parameters for the 10-Second Intake Rule</p>
          </div>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed mt-3">
          Configure a location or a specific supply item below to instantly render a QR code. When cleaning staff scan this sticker, their phones will automatically launch the Intake Form with pre-populated values, saving time and eliminating typos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-7 bg-cream rounded-xl shadow-xs border border-sand-200 p-6 space-y-6">
          <h4 className="text-sm font-bold font-display text-stone-800 border-b border-sand-200 pb-2">Sticker Configuration</h4>

          <div className="space-y-4">
            {/* Location selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-2 font-sans">1. Select Target Location Hub</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation('shibuya');
                    setSelectedItem('all');
                  }}
                  className={`py-3 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedLocation === 'shibuya'
                      ? 'border-sage-500 bg-sage-50 text-sage-800 font-semibold shadow-xs'
                      : 'border-sand-200 hover:border-sand-300 text-stone-600 bg-cream'
                  }`}
                  id="select-shibuya-qr-btn"
                >
                  <span className="block text-sm">Shibuya Office</span>
                  <span className="text-[10px] text-stone-400 font-normal">Commercial Hub</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation('skytree');
                    setSelectedItem('all');
                  }}
                  className={`py-3 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedLocation === 'skytree'
                      ? 'border-sage-500 bg-sage-50 text-sage-800 font-semibold shadow-xs'
                      : 'border-sand-200 hover:border-sand-300 text-stone-600 bg-cream'
                  }`}
                  id="select-skytree-qr-btn"
                >
                  <span className="block text-sm">Jeffrey Skytree</span>
                  <span className="text-[10px] text-stone-400 font-normal">Luxury Guest Suites</span>
                </button>
              </div>
            </div>

            {/* Pre-fill Item selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-2 font-sans">
                2. Pre-fill Specific Supply Item (Optional)
              </label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full text-sm bg-sand-50 border border-sand-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
              >
                <option value="all">Generates General Location-only QR Code</option>
                {filteredItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.unit})
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="bg-sand-50 rounded-lg p-4 border border-sand-200 flex gap-3 text-xs text-stone-600">
            <Info className="w-5 h-5 text-sage-500 flex-none mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-stone-850">Operational Standard Tip:</span>
              <p>
                General location-only QR codes are ideal for mounting on **main storage room doors**. Item-specific QR codes are designed to be printed as tiny 2x2cm stickers stuck directly onto **individual storage shelves or product bins**!
              </p>
            </div>
          </div>
        </div>

        {/* QR Preview Panel */}
        <div className="lg:col-span-5 bg-cream rounded-xl shadow-xs border border-sand-200 p-6 flex flex-col justify-between items-center text-center">
          <h4 className="text-sm font-bold font-display text-stone-800 border-b border-sand-200 w-full pb-2 mb-4">Print Preview</h4>

          {/* Styled SVG QR Code */}
          <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 shadow-inner inline-block mb-4 relative group">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="QR Code" 
                className="w-48 h-48 object-contain rounded-lg" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-stone-400 text-xs">
                Generating QR...
              </div>
            )}

            {/* Floating indicator */}
            <div className="absolute inset-0 flex items-center justify-center bg-stone-800/90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-col gap-2">
              <Smartphone className="w-8 h-8 text-cream animate-bounce" />
              <span className="text-[10px] text-cream font-semibold tracking-wider uppercase font-mono">Camera Scan Link</span>
            </div>
          </div>

          {/* QR details & label info */}
          <div className="space-y-1.5 w-full bg-sand-50 border border-sand-200 rounded-xl p-3 mb-4 text-xs">
            <div className="font-semibold text-stone-800">
              {selectedLocation === 'shibuya' ? 'Shibuya Office Sticker' : 'Jeffrey Skytree Sticker'}
            </div>
            <div className="text-[10px] text-sage-600 font-mono font-bold uppercase tracking-wider">
              {selectedItem === 'all' ? 'GENERAL HUB CARD' : `ITEM: ${activeItem?.name}`}
            </div>
            <div className="text-[10px] text-stone-400 truncate max-w-full font-mono mt-1" title={getQRLink()}>
              {getQRLink()}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2 w-full">
            <button
              onClick={handleSimulateScan}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-sage-500 hover:bg-sage-600 text-cream font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
              id="simulate-scan-btn"
            >
              <Smartphone className="w-4 h-4" />
              Simulate QR Scan (Open Intake Form)
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 py-2 border border-sand-200 hover:border-sand-300 text-stone-700 bg-cream hover:bg-sand-50 rounded-lg text-xs transition-all cursor-pointer"
                id="print-sticker-btn"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Sticker
              </button>
              <a
                href={getQRLink()}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 border border-sand-200 hover:border-sand-300 text-stone-700 bg-cream hover:bg-sand-50 rounded-lg text-xs transition-all cursor-pointer text-center"
                id="open-form-link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Test QR Link
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
