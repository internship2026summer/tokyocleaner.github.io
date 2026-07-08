import React from 'react';
import { BookOpen, CheckCircle, FileText, Smartphone, RefreshCw, AlertTriangle, Printer, Copy, Check } from 'lucide-react';

export default function SOPGuides() {
  const [copiedScript, setCopiedScript] = React.useState(false);

  const googleAppsScriptCode = `// Google Apps Script to paste inside extensions > Apps Script in Google Sheets
// This script forwards Google Form submissions directly to the Tokyo Cleaner Dashboard Webhook.

function onFormSubmit(e) {
  // Get the webhook URL of your deployed applet
  // Note: Replace with your actual Applet URL shown in the Webhook panel
  var webhookUrl = "https://YOUR-APPLET-URL/api/webhook/google-form";
  
  var response = e.response;
  var itemResponses = response.getItemResponses();
  
  var payload = {
    timestamp: response.getTimestamp(),
    staffName: "",
    location: "",
    itemName: "",
    quantity: 0,
    type: "use", // Default to "use" of items
    notes: ""
  };
  
  for (var j = 0; j < itemResponses.length; j++) {
    var itemResponse = itemResponses[j];
    var title = itemResponse.getItem().getTitle().toLowerCase();
    var val = itemResponse.getResponse();
    
    if (title.indexOf("staff") > -1 || title.indexOf("name") > -1) {
      payload.staffName = val;
    } else if (title.indexOf("location") > -1 || title.indexOf("office") > -1) {
      payload.location = val.toLowerCase().indexOf("shibuya") > -1 ? "shibuya" : "skytree";
    } else if (title.indexOf("item") > -1 || title.indexOf("supply") > -1) {
      payload.itemName = val;
    } else if (title.indexOf("quantity") > -1 || title.indexOf("amount") > -1) {
      payload.quantity = Number(val);
    } else if (title.indexOf("notes") > -1 || title.indexOf("comment") > -1) {
      payload.notes = val;
    } else if (title.indexOf("type") > -1 || title.indexOf("action") > -1) {
      payload.type = val.toLowerCase().indexOf("delivery") > -1 ? "delivery" : "use";
    }
  }
  
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    UrlFetchApp.fetch(webhookUrl, options);
  } catch (err) {
    Logger.log("Failed to forward submission: " + err.toString());
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-8" id="sop-guides-section">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cleaning Staff 10-Second Guide */}
        <div className="bg-cream rounded-xl shadow-xs border border-sand-200 p-6 flex flex-col justify-between" id="staff-guide-card">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-sage-50 text-sage-600 rounded-lg">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-stone-800 text-xl">Cleaning Staff Manual</h3>
                <p className="text-xs text-stone-400 font-mono">"Zero-Friction" Logging (10-Second Rule)</p>
              </div>
            </div>
            
            <p className="text-sm text-stone-600 mb-5 leading-relaxed">
              No logins, no typing passwords. To ensure staff logs supplies without friction, staff members can scan the room's QR Code using their phone's camera, opening the Mobile Intake Form directly.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-sage-100 text-sage-700 font-bold text-xs flex items-center justify-center font-mono">1</div>
                <div>
                  <h4 className="text-sm font-bold text-stone-850">Scan QR Code</h4>
                  <p className="text-xs text-stone-500">Every storage cabinet or guest hub has a printed QR card. Scan it directly via smartphone.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-sage-100 text-sage-700 font-bold text-xs flex items-center justify-center font-mono">2</div>
                <div>
                  <h4 className="text-sm font-bold text-stone-850">Pre-populated Form Opens</h4>
                  <p className="text-xs text-stone-500">The mobile web intake form opens with the **Location** (e.g., Shibuya Office) and target **Item** pre-selected instantly.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-sage-100 text-sage-700 font-bold text-xs flex items-center justify-center font-mono">3</div>
                <div>
                  <h4 className="text-sm font-bold text-stone-850">Tap and Submit</h4>
                  <p className="text-xs text-stone-500">Select the quantity used (or restocked) with oversized tap buttons, and tap **TAP TO LOG USAGE**. No staff name required!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-sand-150 bg-sand-50 rounded-lg p-3 flex items-center gap-2 text-xs text-stone-600">
            <CheckCircle className="w-4 h-4 text-sage-600 flex-none" />
            <span>Takes under 10 seconds. Keeps inventories fully accurate in real-time.</span>
          </div>
        </div>

        {/* Management SOP */}
        <div className="bg-cream rounded-xl shadow-xs border border-sand-200 p-6 flex flex-col justify-between" id="management-sop-card">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-clay-50 text-clay-600 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-stone-800 text-xl">Management SOP</h3>
                <p className="text-xs text-stone-400 font-mono">Standard Operating Procedures</p>
              </div>
            </div>

            <p className="text-sm text-stone-600 mb-5 leading-relaxed">
              Maintains dual-location safety standards. This checklist guides inventory cycles, threshold configuration, and monthly shopping compiler activities.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-clay-100 text-clay-700 font-bold text-xs flex items-center justify-center font-mono font-sans">A</div>
                <div>
                  <h4 className="text-sm font-bold text-stone-850">Print QR Codes (Week 5 Target)</h4>
                  <p className="text-xs text-stone-500">Go to the **QR Codes** tab, select the hub (Shibuya or Skytree), and print QR stickers for supply locker doors.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-clay-100 text-clay-700 font-bold text-xs flex items-center justify-center font-mono font-sans">B</div>
                <div>
                  <h4 className="text-sm font-bold text-stone-850">Monitor Safety Thresholds</h4>
                  <p className="text-xs text-stone-500">Verify low-stock notifications highlighted in **red**. Adjust thresholds by clicking on items in the dashboard.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-none w-6 h-6 rounded-full bg-clay-100 text-clay-700 font-bold text-xs flex items-center justify-center font-mono font-sans">C</div>
                <div>
                  <h4 className="text-sm font-bold text-stone-850">Monthly Procurement & Deliveries</h4>
                  <p className="text-xs text-stone-500">Compile low stock items in the **Shopping List** tab, order them, and log new deliveries to update safety stock levels instantly.</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => window.print()}
            className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-sage-500 hover:bg-sage-600 text-cream font-semibold rounded-lg text-sm transition-colors cursor-pointer"
            id="print-sop-btn"
          >
            <Printer className="w-4 h-4" />
            Print Operations Manual
          </button>
        </div>
      </div>

      {/* Eco-Friendly Protocols Section */}
      <div className="bg-gradient-to-br from-sage-900 to-sage-950 text-cream rounded-xl p-6 border border-sage-700" id="eco-standards-panel">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-6 border-b border-sage-900/50">
          <div>
            <div className="flex items-center gap-2 text-clay-300 font-mono text-xs uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse"></span>
              Tokyo Eco-Conscious Standards
            </div>
            <h3 className="font-display font-bold text-2xl text-cream">Japan Green Cleaning Protocols</h3>
            <p className="text-xs text-stone-300 font-mono">Preserving premium spaces with sustainable materials and zero-waste logistics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Microfiber Color Coding */}
          <div className="bg-sage-950/40 rounded-xl p-5 border border-sage-800/45 space-y-3">
            <h4 className="text-sm font-bold text-cream font-display border-b border-sage-900/50 pb-1.5 flex items-center justify-between">
              <span>1. Microfiber Code</span>
              <span className="text-[10px] font-mono text-clay-300">Sanitation Guard</span>
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Maintain strict color isolation to completely prevent cross-contamination across guest rooms and office hubs:
            </p>
            <ul className="text-[11px] space-y-1.5 font-mono text-stone-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Blue: Mirrors, Glass & Screens</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <span>Yellow: Wood, Desks & Panels</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span>Red: High-sanitation (Bathrooms)</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Precision Dilution */}
          <div className="bg-sage-950/40 rounded-xl p-5 border border-sage-800/45 space-y-3">
            <h4 className="text-sm font-bold text-cream font-display border-b border-sage-900/50 pb-1.5 flex items-center justify-between">
              <span>2. Dilution Ratio</span>
              <span className="text-[10px] font-mono text-clay-300">Concentrate Rule</span>
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Always dilute cleaning concentrates with precision measuring cups to maximize material efficiency and reduce environmental footprint:
            </p>
            <ul className="text-[11px] space-y-1.5 font-mono text-stone-300">
              <li className="flex items-center gap-1.5">
                <span className="font-bold text-clay-300">All-Purpose:</span>
                <span>1:50 Ratio (20ml per 1L water)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="font-bold text-clay-300">Disinfectant:</span>
                <span>1:20 Ratio (50ml per 1L water)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="font-bold text-clay-300">Glass Cleaner:</span>
                <span>1:100 Ratio (10ml per 1L water)</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Storage Cabinet SOP */}
          <div className="bg-sage-950/40 rounded-xl p-5 border border-sage-800/45 space-y-3">
            <h4 className="text-sm font-bold text-cream font-display border-b border-sage-900/50 pb-1.5 flex items-center justify-between">
              <span>3. Sustainable Storage</span>
              <span className="text-[10px] font-mono text-clay-300">Stock Rotation</span>
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Store supplies with labels facing forward. Apply the "First-In, First-Out" (FIFO) inventory rule to prevent aging and expiration of active cleaning agents:
            </p>
            <ul className="text-[11px] space-y-1.5 font-mono text-stone-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-clay-400 rounded-full"></span>
                <span>Keep cabinets locked when unattended</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-clay-400 rounded-full"></span>
                <span>Place heaviest items on bottom shelves</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-clay-400 rounded-full"></span>
                <span>Rotate older bottles to front of cabinet</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
