import React from 'react';
import { LogEntry } from '../types';
import { Search, Calendar, Filter, Smartphone, Layers, Plus, RefreshCw, CheckCircle, Clock } from 'lucide-react';

interface StockHistoryProps {
  logs: LogEntry[];
  onRefresh: () => void;
}

export default function StockHistory({ logs, onRefresh }: StockHistoryProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterLocation, setFilterLocation] = React.useState<'all' | 'shibuya' | 'skytree'>('all');
  const [filterType, setFilterType] = React.useState<'all' | 'use' | 'delivery'>('all');
  const [filterSource, setFilterSource] = React.useState<'all' | 'google_form' | 'manual'>('all');

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (log.staffName && log.staffName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = filterLocation === 'all' || log.location === filterLocation;
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesSource = filterSource === 'all' || log.source === filterSource;
    return matchesSearch && matchesLocation && matchesType && matchesSource;
  });

  // Calculate historical usage stats for visual chart (last 7 days simulation)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Custom SVG bar graph inputs (mock data derived or static realistic representation of usage)
  const usageData = [25, 45, 12, 60, 30, 18, 40];
  const deliveryData = [40, 0, 50, 0, 15, 0, 20];
  
  const maxVal = 70; // ceiling for SVG scaling

  return (
    <div className="space-y-6" id="stock-history-panel">
      {/* SVG Analytics Chart */}
      <div className="bg-cream rounded-xl shadow-xs border border-sand-200 p-6">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-sand-100">
          <div>
            <h3 className="font-display font-bold text-stone-800 text-lg">7-Day Supply Throughput</h3>
            <p className="text-[11px] text-stone-400">Comparing inventory usage vs replenishment deliveries (units)</p>
          </div>
          <div className="flex gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-clay-600 font-semibold">
              <span className="w-2.5 h-2.5 bg-clay-500/20 border border-clay-550 rounded-sm inline-block"></span>
              Stock Used
            </span>
            <span className="flex items-center gap-1.5 text-sage-600 font-semibold">
              <span className="w-2.5 h-2.5 bg-sage-500/20 border border-sage-550 rounded-sm inline-block"></span>
              Deliveries
            </span>
          </div>
        </div>

        {/* Beautiful Interactive Responsive SVG Chart */}
        <div className="h-44 w-full relative flex items-end justify-between px-2 pt-4">
          {/* Y-axis grid lines */}
          <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none text-[9px] font-mono text-stone-400">
            <div className="border-b border-sand-100 w-full pb-0.5 text-right">{maxVal}u</div>
            <div className="border-b border-sand-100 w-full pb-0.5 text-right">{Math.round(maxVal / 2)}u</div>
            <div className="border-b border-sand-200 w-full pt-0.5 text-right">0u</div>
          </div>

          {/* Bar loops */}
          <div className="flex-1 flex justify-around items-end h-full relative z-10">
            {days.map((day, idx) => {
              const useHeight = (usageData[idx] / maxVal) * 100;
              const delHeight = (deliveryData[idx] / maxVal) * 100;

              return (
                <div key={day} className="flex flex-col items-center gap-2 group w-full text-center">
                  <div className="flex items-end gap-1.5 h-28 relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-stone-850 text-cream text-[9px] font-mono rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xs">
                      Used: {usageData[idx]} | Del: {deliveryData[idx]}
                    </div>

                    {/* Stock Used Bar */}
                    <div 
                      style={{ height: `${useHeight}%` }}
                      className="w-4 bg-clay-500/20 border-t border-clay-500/60 rounded-t-sm transition-all duration-500 group-hover:bg-clay-500/35"
                    ></div>
                    {/* Deliveries Bar */}
                    <div 
                      style={{ height: `${delHeight}%` }}
                      className="w-4 bg-sage-500/20 border-t border-sage-500/60 rounded-t-sm transition-all duration-500 group-hover:bg-sage-500/35"
                    ></div>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500 font-semibold">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-cream rounded-xl shadow-xs border border-sand-200 overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-4 bg-sand-50 border-b border-sand-200 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-display font-bold text-stone-800 text-lg flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-stone-400" />
              Comprehensive Audit Trail
            </h3>
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 text-xs text-sage-600 hover:text-sage-800 transition-colors cursor-pointer"
              id="history-refresh-btn"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Feed
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-cream border border-sand-200 rounded-lg focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
              />
            </div>

            {/* Hub selector */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-stone-400 flex-none" />
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value as any)}
                className="w-full text-xs bg-cream border border-sand-200 rounded-lg p-2 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
              >
                <option value="all">All Hubs</option>
                <option value="shibuya">Shibuya Office</option>
                <option value="skytree">Jeffrey Skytree</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <Plus className="w-3 h-3 text-stone-400 flex-none" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full text-xs bg-cream border border-sand-200 rounded-lg p-2 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
              >
                <option value="all">All Actions</option>
                <option value="use">Used Supplies (-)</option>
                <option value="delivery">Deliveries (+)</option>
              </select>
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3 h-3 text-stone-400 flex-none" />
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as any)}
                className="w-full text-xs bg-cream border border-sand-200 rounded-lg p-2 focus:ring-1 focus:ring-sage-500 focus:outline-hidden text-stone-700"
              >
                <option value="all">All Sources</option>
                <option value="google_form">Google Forms (QR)</option>
                <option value="manual">Dashboard (Manual)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit trail list */}
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs font-mono" id="no-matching-logs">
            No matching log entries found. Try adjusting your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-sand-50 font-mono text-[10px] text-stone-400 uppercase tracking-wider border-b border-sand-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Supply Item</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">By Staff</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-stone-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold border ${
                        log.location === 'shibuya' 
                          ? 'bg-sage-50 text-sage-700 border-sage-100' 
                          : 'bg-sand-100 text-stone-700 border-sand-200'
                      }`}>
                        {log.location === 'shibuya' ? 'Shibuya Office' : 'Jeffrey Skytree'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-800 whitespace-nowrap">{log.itemName}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.type === 'use' ? (
                        <span className="text-clay-700 font-bold uppercase tracking-wider text-[9px] bg-clay-50 px-1.5 py-0.5 rounded-sm border border-clay-100">Used</span>
                      ) : (
                        <span className="text-sage-700 font-bold uppercase tracking-wider text-[9px] bg-sage-50 px-1.5 py-0.5 rounded-sm border border-sage-100">Delivery</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-700 whitespace-nowrap">
                      {log.type === 'use' ? '-' : '+'}{log.quantity}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-700 font-medium">{log.staffName}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.source === 'google_form' ? (
                        <span className="flex items-center gap-1 text-sage-600 font-mono text-[10px]">
                          <Smartphone className="w-3.5 h-3.5" />
                          Google Form
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-stone-500 font-mono text-[10px]">
                          <Layers className="w-3.5 h-3.5" />
                          Manual
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 truncate max-w-xs" title={log.notes}>
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
