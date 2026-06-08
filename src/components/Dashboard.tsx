import React, { useState } from 'react';
import { formatIDR } from '../utils/currency';
import { NewSaleDrawer } from './NewSaleDrawer';
import {
  DollarSign,
  TrendingUp,
  PackageOpen,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  CheckCircle2,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

interface DashboardProps {
  inventory: any[];
  transactions: any[];
  onAddTransaction: (t: any) => void;
  onUpdateInventory: (items: {id: string, quantityToDeduct: number}[]) => void;
  outOfPocketCapital: number;
  cashReserve: number;
  onInjectCapital: (amount: number) => void;
}

export function Dashboard({ inventory, transactions, onAddTransaction, onUpdateInventory, outOfPocketCapital, cashReserve, onInjectCapital }: DashboardProps) {
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [isInjectModalOpen, setIsInjectModalOpen] = useState(false);
  const [injectAmount, setInjectAmount] = useState('');

  const handleAddAndShowSuccess = (t: any) => {
    onAddTransaction(t);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleInject = () => {
    const amount = parseFloat(injectAmount) || 0;
    if (amount > 0) {
      onInjectCapital(amount);
      setInjectAmount('');
      setIsInjectModalOpen(false);
    }
  };

  const totalRealizedProfits = transactions.reduce((sum, trx) => sum + (trx.total - trx.cost - trx.platform_fee - trx.shipping_cost), 0);
  const activeInventoryValue = inventory.reduce((sum, item) => sum + ((item.currentPrice || 0) * item.quantity), 0);

  const smartFlipLabel = cashReserve > outOfPocketCapital ? 'Capital Surplus' : 'Active Capital at Risk';
  const smartFlipValue = cashReserve > outOfPocketCapital ? cashReserve - outOfPocketCapital : outOfPocketCapital - cashReserve;
  const isSurplus = cashReserve > outOfPocketCapital;

  // Group transactions for the chart
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const chartPoints = Object.entries(
    transactions.reduce((acc, trx) => {
      // In a real app we'd parse the actual date, this is simplified
      const idStr = trx.id.split('-')[1];
      const date = new Date(parseInt(idStr) || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (!acc[date]) acc[date] = { name: date, revenue: 0, cost: 0 };
      acc[date].revenue += trx.total;
      acc[date].cost += trx.cost;
      return acc;
    }, {} as Record<string, any>)
  ).map(([, val]) => val);
  
  // if no points, at least show a flatline
  const chartData = chartPoints.length ? chartPoints : [
    { name: 'Prev', revenue: 0, cost: 0 },
    { name: 'Now', revenue: 0, cost: 0 }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {successMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 z-50">
          <CheckCircle2 size={16} />
          Transaction completed successfully!
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Financial Overview
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsInjectModalOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
          >
            Inject Capital
          </button>
          <button 
            onClick={() => setIsNewSaleOpen(true)}
            className="px-6 py-3 text-base font-bold bg-[#961b2b] text-gray-100 rounded-xl hover:bg-[#961b2b]/95 shadow-[0_4px_12px_rgba(150,27,43,0.3)] hover:shadow-[0_6px_16px_rgba(150,27,43,0.4)] transition-all flex items-center gap-2"
          >
            New Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Out-of-Pocket Capital"
          value={formatIDR(outOfPocketCapital)}
          trend="Base Investment"
          isPositive={null}
          icon={<DollarSign className="text-gray-500" size={20} />}
        />
        <MetricCard
          title="Cash Reserve (Wallet)"
          value={formatIDR(cashReserve)}
          trend={cashReserve >= outOfPocketCapital ? 'Profitable' : 'Deficit'}
          isPositive={cashReserve >= outOfPocketCapital}
          icon={<TrendingUp className="text-[#961b2b]" size={20} />}
        />
        <MetricCard
          title={smartFlipLabel}
          value={formatIDR(smartFlipValue)}
          trend={isSurplus ? 'Net Profit' : 'Exposure'}
          isPositive={isSurplus ? true : false}
          icon={<PackageOpen className={isSurplus ? "text-emerald-600" : "text-[#961b2b]"} size={20} />}
          highlight={isSurplus}
          valueColor={isSurplus ? "text-[#2e7d32]" : "text-gray-900"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue vs Cost of Goods Sold
              </h3>
              <select className="bg-[#f2f2f2] border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#961b2b]/50">
                <option>Last 30 Days</option>
                <option>This Quarter</option>
                <option>Year to Date</option>
              </select>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#961b2b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#961b2b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#52525b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => formatIDR(value)}
                    contentStyle={{
                      backgroundColor: '#f2f2f2',
                      borderColor: '#e5e7eb',
                      color: '#111827',
                      borderRadius: '8px'
                    }}
                    itemStyle={{ color: '#111827' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#961b2b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#52525b"
                    strokeWidth={2}
                    fillOpacity={0.1}
                    fill="#52525b"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent High-Value Transactions
              </h3>
              <button className="text-sm text-[#961b2b] hover:text-[#961b2b] transition-colors">
                View All
              </button>
            </div>
            <InventoryTable transactions={transactions} inventory={inventory} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center gap-2 mb-6">
              <BrainCircuit className="text-[#961b2b]" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                AI Insights
              </h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 text-center border border-dashed border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500">No active insights available.</p>
                <p className="text-xs text-gray-600 mt-1">Add items to trigger AI analysis.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NewSaleDrawer 
        isOpen={isNewSaleOpen} 
        onClose={() => setIsNewSaleOpen(false)} 
        inventory={inventory} 
        onAddTransaction={handleAddAndShowSuccess} 
        onUpdateInventory={onUpdateInventory} 
      />

      {isInjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsInjectModalOpen(false)}
          />
          <div className="relative bg-[#f2f2f2] border border-gray-200 rounded-[12px] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-white border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Inject Capital</h3>
              <p className="text-sm text-gray-500 mt-1">Add funds to your Out-of-Pocket capital and Cash Reserve.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (IDR)</label>
                <input
                  type="number"
                  value={injectAmount}
                  onChange={(e) => setInjectAmount(e.target.value)}
                  placeholder="e.g. 1000000"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#961b2b]/50 focus:ring-1 focus:ring-[#961b2b]/50 transition-all font-mono"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsInjectModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInject}
                  disabled={!injectAmount || parseFloat(injectAmount) <= 0}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-[#961b2b] text-gray-100 rounded-lg hover:bg-[#961b2b]/95 disabled:opacity-50 transition-all shadow-sm"
                >
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  isPositive,
  icon,
  highlight = false,
  valueColor = 'text-gray-900',
}: {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean | null;
  icon: React.ReactNode;
  highlight?: boolean;
  valueColor?: string;
}) {
  return (
    <div
      className={`p-6 rounded-[12px] border ${
        highlight
          ? 'bg-gradient-to-br from-white to-gray-50 border-[#961b2b]/30 shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
          : 'bg-white border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-[#f2f2f2] rounded-lg">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2 overflow-hidden">
        <span
          className={`text-2xl lg:text-3xl font-bold tracking-tight truncate ${valueColor}`}
        >
          {value}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-sm">
        {isPositive !== null && (
          <span
            className={`flex items-center ${
              isPositive ? 'text-emerald-500' : 'text-[#961b2b]'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            {trend}
          </span>
        )}
        {isPositive === null && (
          <span className="text-gray-500 font-medium">{trend}</span>
        )}
      </div>
    </div>
  );
}

function AiRecommendationCard({
  type,
  title,
  description,
  action,
}: {
  type: 'pricing' | 'slow-moving' | 'restock';
  title: string;
  description: string;
  action: string;
}) {
  const getIcon = () => {
    switch (type) {
      case 'pricing':
        return <TrendingUp size={16} className="text-blue-400" />;
      case 'slow-moving':
        return <PackageOpen size={16} className="text-yellow-400" />;
      case 'restock':
        return <AlertTriangle size={16} className="text-[#961b2b]" />;
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#f2f2f2] border border-gray-200 hover:border-gray-200 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="mt-1 p-1.5 bg-white rounded-md border border-gray-200">
          {getIcon()}
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-800">{title}</h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {description}
          </p>
          <button className="mt-3 text-xs font-medium text-[#961b2b] hover:text-[#961b2b] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {action} <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function InventoryTable({ transactions, inventory }: { transactions: any[], inventory: any[] }) {
  const recentTransactions = [...transactions].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'In-Store POS':
        return 'bg-[#961b2b]/10 text-[#961b2b] border-[#961b2b]/20';
      case 'Tokopedia':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'TikTok Shop':
        return 'bg-gray-800/10 text-gray-900 border-gray-800/20';
      case 'Shopee':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'eBay':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-[#961b2b]/10 text-[#961b2b] border-[#961b2b]/20';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-200">
            <th className="pb-3 font-medium">Item</th>
            <th className="pb-3 font-medium">Channel</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 font-medium text-right">Amount</th>
            <th className="pb-3 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {recentTransactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500">
                No recent transactions
              </td>
            </tr>
          ) : (
            recentTransactions.map((trx) => {
              const firstItem = trx.items[0];
              const invItem = inventory.find(i => i.id === firstItem.id);
              const itemName = firstItem ? firstItem.name : 'Unknown Item';
              const addition = trx.items.length > 1 ? ` + ${trx.items.length - 1} more` : '';
              
              const isProfit = (trx.total - trx.cost - trx.platform_fee - trx.shipping_cost) > 0;

              return (
                <tr key={trx.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <div className="font-medium text-gray-800">{itemName}{addition}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{trx.id}</div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${getChannelBadge(trx.channel)}`}>
                      {trx.channel}
                    </span>
                  </td>
                  <td className="py-4 text-gray-500">{firstItem ? firstItem.category : 'N/A'}</td>
                  <td className={`py-4 text-right font-mono ${isProfit ? 'text-emerald-500' : 'text-[#961b2b]'}`}>
                    {formatIDR(trx.total)}
                  </td>
                  <td className="py-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        trx.status === 'Completed' ? 'text-emerald-500' : 'text-gray-500'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          trx.status === 'Completed' ? 'bg-emerald-500' : 'bg-gray-400'
                        }`}
                      />
                      {trx.status}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

const chartData: any[] = [];
