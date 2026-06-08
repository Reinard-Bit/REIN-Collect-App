import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  LogOut,
  BrainCircuit,
} from 'lucide-react';

export function Sidebar({ currentView, onViewChange }: { currentView: string, onViewChange: (view: string) => void }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#961b2b] flex items-center justify-center">
          <span className="font-bold text-gray-900 text-lg">R</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          REIN Collects
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => onViewChange('dashboard')} />
        <NavItem icon={<Package size={20} />} label="Inventory" active={currentView === 'inventory'} onClick={() => onViewChange('inventory')} />
        <NavItem icon={<ShoppingCart size={20} />} label="Procurement" active={currentView === 'procurement'} onClick={() => onViewChange('procurement')} />
        <NavItem icon={<TrendingUp size={20} />} label="Transactions" active={currentView === 'transactions'} onClick={() => onViewChange('transactions')} />
        <NavItem icon={<BrainCircuit size={20} />} label="AI Insights" active={currentView === 'insights'} onClick={() => onViewChange('insights')} />
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <NavItem icon={<Settings size={20} />} label="Settings" />
        <NavItem icon={<LogOut size={20} />} label="Logout" />
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        active
          ? 'bg-[#961b2b]/10 text-[#961b2b] font-medium'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#961b2b] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
      )}
    </button>
  );
}
