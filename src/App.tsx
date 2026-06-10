/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Inventory } from './components/Inventory';
import { Procurement } from './components/Procurement';
import { ProcurementHistory } from './components/ProcurementHistory';
import { Transactions } from './components/Transactions';
import { AiInsights } from './components/AiInsights';
import { Settings } from './components/Settings';
import { BarcodeScanner } from './components/BarcodeScanner';

export interface InventoryBatch {
  batchId: string;
  date: string;
  qty: number;
  costBasis: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  set: string;
  category: string;
  condition: string;
  foilType: string;
  gradingCompany: string | null;
  certNumber: string | null;
  quantity: number;
  costBasis: number;
  currentPrice: number;
  imageUrl: string | null;
  cardNumber?: string;
  rarity?: string;
  language?: string;
  batches?: InventoryBatch[];
  acquisitionDate?: string;
}

export interface ProcurementRecord {
  id: string;
  date: string;
  type: string;
  itemName: string;
  description: string;
  supplier: string;
  totalCost: number;
}

export interface CatalogItem {
  itemName: string;
  setName: string;
  cardNumber?: string;
  rarity?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState('insights');
  const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [scannedProcurementEvent, setScannedProcurementEvent] = useState<{code: string, timestamp: number} | null>(null);
  const [scannedSellEvent, setScannedSellEvent] = useState<{code: string, timestamp: number} | null>(null);
  const scanLockRef = useRef(false);
  
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
  const [masterCatalog, setMasterCatalog] = useState<CatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem('bandit_catalog');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [procurementRecords, setProcurementRecords] = useState<ProcurementRecord[]>(() => {
    try {
      const saved = localStorage.getItem('bandit_procurements');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [transactions, setTransactions] = useState<any[]>(() => {
    try {
       const saved = localStorage.getItem('bandit_transactions');
       return saved ? JSON.parse(saved) : [];
    } catch {
       return [];
    }
  });

  const [outOfPocketCapital, setOutOfPocketCapital] = useState(() => {
    try {
      const saved = localStorage.getItem('bandit_outOfPocket');
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [cashReserve, setCashReserve] = useState(() => {
    try {
      const saved = localStorage.getItem('bandit_cashReserve');
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [capitalInjections, setCapitalInjections] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('bandit_capital_injections');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (outOfPocketCapital > 0 && capitalInjections.length === 0) {
      setCapitalInjections([
        {
          id: 'INJ-INITIAL',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          amount: outOfPocketCapital
        }
      ]);
    }
  }, [outOfPocketCapital, capitalInjections.length]);

  useEffect(() => {
    localStorage.setItem('bandit_outOfPocket', outOfPocketCapital.toString());
  }, [outOfPocketCapital]);

  useEffect(() => {
    localStorage.setItem('bandit_cashReserve', cashReserve.toString());
  }, [cashReserve]);

  useEffect(() => {
    localStorage.setItem('bandit_capital_injections', JSON.stringify(capitalInjections));
  }, [capitalInjections]);

  useEffect(() => {
    localStorage.setItem('bandit_procurements', JSON.stringify(procurementRecords));
  }, [procurementRecords]);

  useEffect(() => {
    localStorage.setItem('bandit_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bandit_catalog', JSON.stringify(masterCatalog));
  }, [masterCatalog]);

  const handleScanSuccess = (decodedText: string) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;
    
    setIsGlobalScannerOpen(false);
    const code = decodedText.trim().toUpperCase();
    
    let foundItemId: string | null = null;
    for (const item of inventoryItems) {
      const itemIdSanitized = item.id ? item.id.trim().toUpperCase() : '';
      const matchesBatch = item.batches?.some(b => b.batchId && b.batchId.trim().toUpperCase() === code);
      
      if (itemIdSanitized === code || matchesBatch) {
        foundItemId = item.id;
        break;
      }
    }

    if (foundItemId) {
      setScannedSellEvent({ code: foundItemId, timestamp: Date.now() });
      setCurrentView('transactions');
    } else {
      setScannedProcurementEvent({ code: code, timestamp: Date.now() });
      setCurrentView('procurement');
    }

    setTimeout(() => {
      scanLockRef.current = false;
    }, 1500);
  };

  const handleInjectCapital = (amount: number) => {
    const displayDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newInjection = {
      id: `INJ-${Date.now()}`,
      date: displayDate,
      amount: amount
    };
    setCapitalInjections(prev => [newInjection, ...prev]);
    setOutOfPocketCapital(prev => prev + amount);
    setCashReserve(prev => prev + amount);
  };

  const handleAddItem = (newItem: InventoryItem) => {
    setMasterCatalog(prev => {
      const exists = prev.some(c => 
        c.itemName === newItem.name && 
        c.setName === newItem.set && 
        c.cardNumber === newItem.cardNumber && 
        c.rarity === newItem.rarity
      );
      if (!exists) {
        return [...prev, { 
          itemName: newItem.name, 
          setName: newItem.set, 
          cardNumber: newItem.cardNumber, 
          rarity: newItem.rarity 
        }];
      }
      return prev;
    });

    setInventoryItems(prev => {
      const displayDate = newItem.acquisitionDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const newBatch: InventoryBatch = {
        batchId: newItem.id,
        date: displayDate,
        qty: newItem.quantity || 1,
        costBasis: newItem.costBasis
      };

      if (newItem.category !== 'Slab') {
        const existingIndex = prev.findIndex(item => 
          item.category !== 'Slab' &&
          item.name === newItem.name && 
          item.set === newItem.set && 
          item.language === newItem.language && 
          item.condition === newItem.condition && 
          item.foilType === newItem.foilType
        );

        if (existingIndex >= 0) {
          const oldItem = prev[existingIndex];
          const incomingQuantity = newBatch.qty;
          const newQuantity = (oldItem.quantity || 0) + incomingQuantity;
          const oldBatches = oldItem.batches || [{
            batchId: `BCH-LEGACY-${oldItem.id}`,
            date: 'Legacy',
            qty: oldItem.quantity || 1,
            costBasis: oldItem.costBasis
          }];
          
          const newCostBasis = ((oldItem.quantity || 0) * (oldItem.costBasis || 0) + (newItem.costBasis * incomingQuantity)) / newQuantity;

          const updatedItems = [...prev];
          updatedItems[existingIndex] = {
            ...oldItem,
            quantity: newQuantity,
            costBasis: newCostBasis,
            batches: [...oldBatches, newBatch]
          };
          return updatedItems;
        }
      }
      
      const itemWithBatch = { ...newItem, batches: [newBatch] };
      return [itemWithBatch, ...prev];
    });
  };

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setInventoryItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteItem = (id: string) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateInventory = (itemsToUpdate: { id: string; quantityToDeduct: number }[]) => {
    setInventoryItems(prev => prev.map(item => {
      const update = itemsToUpdate.find(u => u.id === item.id);
      if (update) {
        let remainingToDeduct = update.quantityToDeduct;
        const oldBatches = item.batches && item.batches.length > 0 
          ? [...item.batches] 
          : [{ batchId: `BCH-LEGACY-${item.id}`, date: 'Legacy', qty: item.quantity, costBasis: item.costBasis }];
        
        const newBatches: InventoryBatch[] = [];
        for (const batch of oldBatches) {
          if (remainingToDeduct <= 0) {
            newBatches.push(batch);
            continue;
          }
          if (batch.qty <= remainingToDeduct) {
            remainingToDeduct -= batch.qty;
            // batch is depleted, don't push
          } else {
            newBatches.push({ ...batch, qty: batch.qty - remainingToDeduct });
            remainingToDeduct = 0;
          }
        }

        const newQuantity = Math.max(0, item.quantity - update.quantityToDeduct);
        const newCostBasis = newBatches.length > 0 
          ? newBatches.reduce((sum, b) => sum + (b.costBasis * b.qty), 0) / newBatches.reduce((sum, b) => sum + b.qty, 0)
          : item.costBasis;

        return { 
          ...item, 
          quantity: newQuantity,
          costBasis: newCostBasis,
          batches: newBatches
        };
      }
      return item;
    }));
  };

  const handleAddProcurements = (records: ProcurementRecord[]) => {
    setProcurementRecords(prev => [...records, ...prev]);
    const totalCost = records.reduce((sum, record) => sum + record.totalCost, 0);
    setCashReserve(prev => prev - totalCost);
  };

  const handleAddTransaction = (transaction: any) => {
    setTransactions(prev => [transaction, ...prev]);
    const netCashAdded = transaction.total - (transaction.platform_fee || 0) - (transaction.shipping_cost || 0);
    setCashReserve(prev => prev + netCashAdded);
  };

  return (
    <div className="flex h-screen bg-[#f2f2f2] text-gray-900 font-sans overflow-hidden w-full">
      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        <Header 
          onOpenScanner={() => setIsGlobalScannerOpen(true)} 
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
          {currentView === 'dashboard' && (
            <Dashboard 
              inventory={inventoryItems} 
              transactions={transactions} 
              onAddTransaction={handleAddTransaction} 
              onUpdateInventory={handleUpdateInventory} 
              outOfPocketCapital={outOfPocketCapital} 
              cashReserve={cashReserve} 
              onInjectCapital={handleInjectCapital}
              capitalInjections={capitalInjections}
              procurementRecords={procurementRecords}
            />
          )}
          {currentView === 'inventory' && (
             <Inventory 
              items={inventoryItems} 
              onNavigateToProcurement={() => setCurrentView('procurement')} 
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
            />
          )}
          {currentView === 'procurement' && (
            <Procurement 
              key={scannedProcurementEvent?.timestamp || 'procurement'}
              masterCatalog={masterCatalog}
              onAddItem={handleAddItem} 
              procurementRecords={procurementRecords}
              onAddProcurements={handleAddProcurements}
              onNavigateToHistory={() => setCurrentView('procurementHistory')}
              initialSerialNumber={scannedProcurementEvent ? scannedProcurementEvent.code : ''}
              onOpenScanner={() => setIsGlobalScannerOpen(true)}
            />
          )}
          {currentView === 'procurementHistory' && (
            <ProcurementHistory 
              records={procurementRecords} 
              onBack={() => setCurrentView('procurement')}
            />
          )}
          {currentView === 'transactions' && (
            <Transactions 
              key={scannedSellEvent?.timestamp || 'transactions'}
              inventory={inventoryItems}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onUpdateInventory={handleUpdateInventory}
              initialSellItemCode={scannedSellEvent ? scannedSellEvent.code : ''}
            />
          )}
          {currentView === 'insights' && <AiInsights />}
          {currentView === 'settings' && (
            <Settings 
              masterCatalog={masterCatalog}
              onUpdateCatalog={(updated) => setMasterCatalog(updated)}
            />
          )}
        </main>
      </div>

      <BarcodeScanner 
        isOpen={isGlobalScannerOpen} 
        onClose={() => setIsGlobalScannerOpen(false)} 
        onScan={handleScanSuccess} 
      />
    </div>
  );
}

