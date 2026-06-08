import React, { useState, useCallback, useRef } from 'react';
import { Search, Plus, PackageOpen, DollarSign, Calendar, User, Tag, Layers, Clock, Hash, Image as ImageIcon, Upload, Loader2, Trash2, Check, X, QrCode as QrCodeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatIDR } from '../utils/currency';
import { CurrencyInput } from './CurrencyInput';
import { InventoryItem, CatalogItem } from '../App';
import { BatchQRGeneratorModal } from './BatchQRGeneratorModal';

export interface ProcurementRecord {
  id: string;
  date: string;
  type: string;
  itemName: string;
  description: string;
  supplier: string;
  totalCost: number;
}

interface ProcurementProps {
  masterCatalog: CatalogItem[];
  onAddItem: (item: InventoryItem) => void;
  procurementRecords: ProcurementRecord[];
  onAddProcurements: (records: ProcurementRecord[]) => void;
  onNavigateToHistory: () => void;
  initialSerialNumber?: string | null;
}

type ProcurementMode = 'manual' | 'scanner';

export function Procurement({ masterCatalog, onAddItem, procurementRecords, onAddProcurements, onNavigateToHistory, initialSerialNumber }: ProcurementProps) {
  const [mode, setMode] = useState<ProcurementMode>('manual');
  const [showBatchQRModal, setShowBatchQRModal] = useState(false);
  
  const recentProcurements = procurementRecords.slice(0, 5);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Procurement Module
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Log new inventory acquisitions and bulk collection intakes.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button 
            onClick={() => setShowBatchQRModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <QrCodeIcon size={16} />
            Bulk Labels
          </button>
          
          {/* Mode Toggle */}
          <div className="flex p-1 bg-white border border-gray-200 rounded-full w-fit">
          <button
            onClick={() => setMode('manual')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'manual'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setMode('scanner')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'scanner'
                ? 'bg-[#961b2b] text-gray-900 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${mode === 'scanner' ? 'bg-white animate-pulse' : 'bg-[#961b2b]'}`} />
            Bulk AI Scanner
          </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        {mode === 'manual' ? (
          <ManualEntryForm 
            masterCatalog={masterCatalog}
            onAddItem={onAddItem} 
            onAddProcurement={(record) => onAddProcurements([record])}
            initialSerialNumber={initialSerialNumber || ''}
          />
        ) : (
          <BulkScannerInterface 
            onAddItems={(items) => {
              items.forEach(onAddItem);
              setMode('manual'); // Switch back after adding
            }} 
            onAddProcurements={(records) => onAddProcurements(records)}
          />
        )}
      </div>

      {/* Recent Procurements Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Procurements</h3>
          <button 
            onClick={onNavigateToHistory}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            View Full History
          </button>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200 bg-[#f2f2f2]/50">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Item / Description</th>
                  <th className="px-6 py-4 font-medium">Supplier</th>
                  <th className="px-6 py-4 font-medium text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentProcurements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No recent procurements
                    </td>
                  </tr>
                ) : (
                  recentProcurements.map((proc) => (
                    <tr key={proc.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock size={14} className="text-gray-500" />
                          {proc.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md border text-xs font-medium whitespace-nowrap ${
                          proc.type === 'Raw Card' 
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                            : proc.type === 'Graded Slab'
                              ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {proc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{proc.itemName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{proc.description}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {proc.supplier}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-gray-700">
                        <span className="text-gray-500/50 mr-1">Rp</span>
                        {formatIDR(proc.totalCost).replace('Rp', '').trim()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <BatchQRGeneratorModal 
        isOpen={showBatchQRModal}
        onClose={() => setShowBatchQRModal(false)}
      />
    </div>
  );
}

function BulkScannerInterface({ 
  onAddItems, 
  onAddProcurements 
}: { 
  onAddItems: (items: InventoryItem[]) => void;
  onAddProcurements: (records: ProcurementRecord[]) => void;
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<(InventoryItem & { tempId: string, supplier: string })[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Batch Metadata
  const [batchSupplier, setBatchSupplier] = useState('');
  const [batchDate, setBatchDate] = useState(() => {
    // Format local time to YYYY-MM-DDThh:mm for datetime-local input
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [batchDeliveryFee, setBatchDeliveryFee] = useState(0);
  const [batchPpnImpor, setBatchPpnImpor] = useState(0);
  const [batchPphImpor, setBatchPphImpor] = useState(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const simulateAIScan = async (files: FileList | File[]) => {
    setIsScanning(true);
    
    const fileArray = Array.from(files);

    const initialItems: (InventoryItem & { tempId: string, supplier: string, fileObj?: File })[] = fileArray.map((file, index) => {
      const objectUrl = URL.createObjectURL(file);
      
      return {
        tempId: `TEMP-${Date.now()}-${index}`,
        id: `INV-${Date.now()}-${index}`,
        name: '',
        set: '',
        category: 'Single',
        condition: 'NM',
        foilType: 'Non-Foil',
        gradingCompany: null,
        certNumber: null,
        quantity: 1,
        costBasis: 0,
        currentPrice: 0,
        imageUrl: objectUrl,
        cardNumber: '',
        rarity: '',
        language: 'English',
        supplier: '',
        fileObj: file
      };
    });

    setScannedItems(prev => [...prev, ...initialItems.map(item => ({...item, fileObj: undefined}))]);
    setIsScanning(false);

    // Process images via API concurrently
    fileArray.forEach(async (file, index) => {
      const tempId = initialItems[index].tempId;
      try {
        const formData = new FormData();
        formData.append("image", file);
        
        const response = await fetch("/api/scan-card", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const text = await response.text();
          try {
            const data = JSON.parse(text);
            setScannedItems(prev => prev.map(item => {
              if (item.tempId === tempId) {
                return {
                  ...item,
                  name: item.name || data.itemName || '',
                  set: item.set || data.cardSetName || '',
                  cardNumber: item.cardNumber || data.cardNumber || '',
                  rarity: item.rarity || data.rarity || '',
                  foilType: data.foilType && item.foilType === 'Non-Foil' ? data.foilType : item.foilType,
                };
              }
              return item;
            }));
          } catch (e) {
            console.error("Failed to parse JSON for tempId", tempId, text);
          }
        } else {
          console.error("Server API returned error for tempId", tempId, response.status);
        }
      } catch (err) {
        console.error("AI Analysis fetch failed for tempId", tempId, err);
      }
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateAIScan(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateAIScan(e.target.files);
    }
  };

  const updateItem = (tempId: string, field: keyof InventoryItem | 'supplier', value: any) => {
    setScannedItems(prev => prev.map(item => 
      item.tempId === tempId ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (tempId: string) => {
    setScannedItems(prev => prev.filter(item => item.tempId !== tempId));
  };

  const handleConfirm = () => {
    const totalItems = scannedItems.length;
    if (totalItems === 0) return;

    const totalAdditionalFees = batchPpnImpor + batchPphImpor + batchDeliveryFee;
    const feePerItem = totalAdditionalFees / totalItems;

    const itemsToAdd = scannedItems.map(({ tempId, supplier, ...item }) => {
      const finalAdjustedCost = item.costBasis + feePerItem;
      return {
        ...item,
        costBasis: Math.round(finalAdjustedCost)
      };
    });
    
    const displayDate = new Date(batchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const records: ProcurementRecord[] = scannedItems.map((item, idx) => ({
      id: `PRC-${Date.now()}-${item.tempId}`,
      date: displayDate,
      type: item.category === 'Slab' ? 'Graded Slab' : item.category === 'Sealed' ? 'Sealed Product' : 'Raw Card',
      itemName: item.name,
      description: `${item.set}${item.cardNumber ? ` • ${item.cardNumber}` : ''}`,
      supplier: batchSupplier || 'Unknown',
      totalCost: itemsToAdd[idx].costBasis
    }));

    onAddProcurements(records.reverse());
    onAddItems(itemsToAdd);
    setScannedItems([]);
    setBatchSupplier('');
    setBatchDeliveryFee(0);
    setBatchPpnImpor(0);
    setBatchPphImpor(0);
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div 
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          dragActive 
            ? 'border-[#961b2b] bg-[#961b2b]/5' 
            : 'border-gray-200 bg-[#f2f2f2]/90 hover:border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
          {isScanning ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-[#961b2b] animate-spin" />
              <p className="text-lg font-medium text-gray-900">AI Vision Scanner analyzing cards...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Drag & Drop Card or Slab Images Here</p>
                <p className="text-sm text-gray-500 mt-1">Bulk Upload Supported • JPG, PNG, WEBP</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pending Review List */}
      {scannedItems.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Global Batch Metadata Panel */}
          <div className="bg-white border border-[#961b2b]/40 rounded-2xl p-6 space-y-4 shadow-[0_0_15px_rgba(220,38,38,0.05)]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#961b2b] mb-4">Batch Settings & Invoice Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Supplier / Seller</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={batchSupplier}
                    onChange={(e) => setBatchSupplier(e.target.value)}
                    placeholder="Distributor, Walk-in, etc."
                    className="w-full bg-[#f2f2f2] border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-800 placeholder-gray-600 focus:outline-none focus:shadow-[0_0_5px_#961b2b] focus:border-[#961b2b]/50 transition-all block"
                  />
                </div>
              </div>
              <div className="space-y-2 lg:col-span-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Date & Time</label>
                <input
                  type="datetime-local"
                  value={batchDate}
                  onChange={(e) => setBatchDate(e.target.value)}
                  className="w-full bg-[#f2f2f2] border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:shadow-[0_0_5px_#961b2b] focus:border-[#961b2b]/50 transition-all block appearance-none"
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Delivery Fee (Rp)</label>
                <CurrencyInput value={batchDeliveryFee} onChange={setBatchDeliveryFee} className="h-[38px] text-sm bg-[#f2f2f2]" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">PPN Impor (Rp)</label>
                <CurrencyInput value={batchPpnImpor} onChange={setBatchPpnImpor} className="h-[38px] text-sm bg-[#f2f2f2]" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">PPh Impor (Rp)</label>
                <CurrencyInput value={batchPphImpor} onChange={setBatchPphImpor} className="h-[38px] text-sm bg-[#f2f2f2]" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Pending Review ({scannedItems.length})
              </h3>
              <button 
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium bg-[#961b2b] text-gray-900 rounded-lg hover:bg-[#961b2b]/90 shadow-[0_0_15px_rgba(150,27,43,0.3)] transition-all"
              >
                <Check size={16} />
                Confirm & Add All to Vault
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {scannedItems.map((item) => (
              <div key={item.tempId} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-6 group hover:border-gray-300 transition-colors">
                {/* Image Thumbnail */}
                <div className="w-full md:w-32 h-40 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  )}
                  <div className="absolute top-2 right-2 bg-gray-200/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-gray-900 uppercase border border-gray-200">
                    {item.category === 'Slab' ? 'Graded Slab' : item.category === 'Sealed' ? 'Sealed Product' : 'Raw Card'}
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-gray-500">Item Name</label>
                    <input 
                      value={item.name}
                      onChange={(e) => updateItem(item.tempId, 'name', e.target.value)}
                      className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:border-[#961b2b] focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-gray-500">Set</label>
                    <input 
                      value={item.set}
                      onChange={(e) => updateItem(item.tempId, 'set', e.target.value)}
                      className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:border-[#961b2b] focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-gray-500">Card #</label>
                    <input 
                      value={item.cardNumber || ''}
                      onChange={(e) => updateItem(item.tempId, 'cardNumber', e.target.value)}
                      className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:border-[#961b2b] focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-gray-500">Rarity</label>
                    <input 
                      value={item.rarity || ''}
                      onChange={(e) => updateItem(item.tempId, 'rarity', e.target.value)}
                      className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:border-[#961b2b] focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-gray-500">Language</label>
                    <select 
                      value={item.language || 'English'}
                      onChange={(e) => updateItem(item.tempId, 'language', e.target.value)}
                      className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:border-[#961b2b] focus:outline-none transition-all appearance-none"
                    >
                      <option value="English">English</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Indonesian">Indonesian</option>
                      <option value="Traditional Chinese">Traditional Chinese</option>
                    </select>
                  </div>
                  
                  {item.category === 'Slab' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-semibold text-gray-500">Grader</label>
                        <select 
                          value={item.gradingCompany || ''}
                          onChange={(e) => updateItem(item.tempId, 'gradingCompany', e.target.value)}
                          className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:border-[#961b2b] focus:outline-none transition-all appearance-none"
                        >
                          <option value="PSA">PSA</option>
                          <option value="BGS">BGS</option>
                          <option value="CGC">CGC</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-semibold text-gray-500">Grade</label>
                        <input 
                          value={item.condition}
                          onChange={(e) => updateItem(item.tempId, 'condition', e.target.value)}
                          placeholder="10, 9.5..."
                          className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:border-[#961b2b] focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-semibold text-gray-500">Cert #</label>
                        <input 
                          value={item.certNumber || ''}
                          onChange={(e) => updateItem(item.tempId, 'certNumber', e.target.value)}
                          className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:border-[#961b2b] focus:outline-none transition-all font-mono"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-gray-500">Cost Basis</label>
                    <CurrencyInput 
                      value={item.costBasis} 
                      onChange={(val) => updateItem(item.tempId, 'costBasis', val)}
                      className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:border-[#961b2b] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-start pt-4 sm:pt-6">
                  <button 
                    onClick={() => removeItem(item.tempId)}
                    className="p-2 text-gray-500 hover:text-[#961b2b] hover:bg-[#961b2b]/10 rounded-lg transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function ManualEntryForm({ 
  masterCatalog,
  onAddItem, 
  onAddProcurement,
  initialSerialNumber
}: { 
  masterCatalog: CatalogItem[];
  onAddItem: (item: InventoryItem) => void;
  onAddProcurement: (record: ProcurementRecord) => void;
  initialSerialNumber: string;
}) {
  const [continuousIntake, setContinuousIntake] = useState(false);
  const [serialNumber, setSerialNumber] = useState(initialSerialNumber || '');
  const [successToast, setSuccessToast] = useState('');
  
  React.useEffect(() => {
    if (initialSerialNumber) {
      setSerialNumber(initialSerialNumber);
    }
  }, [initialSerialNumber]);
  
  const [category, setCategory] = useState('Single'); // 'Single' = Raw Card, 'Slab' = Graded Slab, 'Sealed' = Sealed Product
  const [sealedType, setSealedType] = useState('Sealed Box');
  const [costBasis, setCostBasis] = useState(0);
  const [itemName, setItemName] = useState('');
  const [cardSetName, setCardSetName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [rarity, setRarity] = useState('');
  const [language, setLanguage] = useState('English');
  const [condition, setCondition] = useState('NM');
  const [foilType, setFoilType] = useState('Non-Foil');
  const [gradingCompany, setGradingCompany] = useState('');
  const [grade, setGrade] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = masterCatalog.filter(c => 
    itemName && c.itemName.toLowerCase().includes(itemName.toLowerCase())
  ).slice(0, 5);

  const handleSelectSuggestion = (suggestion: CatalogItem) => {
    setItemName(suggestion.itemName);
    setCardSetName(suggestion.setName);
    if (suggestion.cardNumber) setCardNumber(suggestion.cardNumber);
    if (suggestion.rarity) setRarity(suggestion.rarity);
    setShowSuggestions(false);
    clearError('itemName');
    clearError('cardSetName');
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const isBoxOrCase = category === 'Sealed' && (sealedType === 'Sealed Box' || sealedType === 'Sealed Case');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));

      setIsAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/scan-card", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const text = await response.text();
          try {
            const data = JSON.parse(text);
            setItemName(prev => prev || data.itemName || '');
            setCardSetName(prev => prev || data.cardSetName || '');
            setCardNumber(prev => prev || data.cardNumber || '');
            setRarity(prev => prev || data.rarity || '');
            if (data.foilType) {
              setFoilType(prev => prev === 'Non-Foil' ? data.foilType : prev);
            }
          } catch (e) {
            console.error("Failed to parse JSON, raw response:", text);
          }
        } else {
          const text = await response.text();
          console.error("Server error:", response.status, text);
        }
      } catch (err) {
        console.error("AI Analysis failed:", err);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const serialInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};

    if (!itemName || !itemName.trim()) newErrors.itemName = true;
    if (!cardSetName || !cardSetName.trim()) newErrors.cardSetName = true;
    if (!costBasis || typeof costBasis !== 'number' || costBasis <= 0) newErrors.costBasis = true;

    if (category === 'Slab') {
      if (!gradingCompany) newErrors.gradingCompany = true;
      if (!grade || !grade.trim()) newErrors.grade = true;
      if (!certNumber || !certNumber.trim()) newErrors.certNumber = true;
    } else if (category === 'Single') {
      if (!condition) newErrors.condition = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const assignedId = serialNumber && serialNumber.trim() ? serialNumber.trim() : `INV-${Date.now()}`;

    const newItem: InventoryItem = {
      id: assignedId,
      name: itemName,
      set: cardSetName,
      category,
      condition: category === 'Slab' ? grade : condition,
      foilType: isBoxOrCase ? 'N/A' : foilType,
      gradingCompany: category === 'Slab' ? gradingCompany : null,
      certNumber: category === 'Slab' ? certNumber : null,
      quantity: 1, // Default to 1 for single item buy
      costBasis,
      currentPrice: 0, // Needs to be set later or defaulted
      imageUrl: imageUrl || null,
      cardNumber: isBoxOrCase ? '' : cardNumber,
      rarity: isBoxOrCase ? '' : rarity,
      language
    };

    const newRecord: ProcurementRecord = {
      id: `PRC-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: category === 'Slab' ? 'Graded Slab' : category === 'Sealed' ? sealedType : 'Raw Card',
      itemName: itemName,
      description: `${cardSetName}${!isBoxOrCase && cardNumber ? ` • ${cardNumber}` : ''}`,
      supplier: supplier || 'Unknown',
      totalCost: costBasis
    };

    onAddProcurement(newRecord);
    onAddItem({ ...newItem, id: assignedId }); // `id` could change if stacked, but `onAddItem` handles creating newBatch with assignedId via changes there? Wait, `onAddItem` will use Date.now() for the batchid. We should pass the batchId explicitly or we can modify `onAddItem` to check if `newItem.id` starts with 'INV-' or 'SN-' and use it? No, in App.tsx `onAddItem` uses `id` for new items, but batch gets `BCH-Date.now()`. I'll pass a special field `boundBatchId`. Wait, I can just use `newItem.id` as the batch Id in App.tsx!

    if (continuousIntake) {
      setSuccessToast(`Bound to ${assignedId}`);
      setTimeout(() => setSuccessToast(''), 3000);
      setSerialNumber('');
      setTimeout(() => serialInputRef.current?.focus(), 50);
    } else {
      // Reset form
      setItemName('');
      setCardSetName('');
      setImageUrl('');
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setCardNumber('');
      setRarity('');
      setCostBasis(0);
      setSupplier('');
      setCertNumber('');
      setGradingCompany('');
      setGrade('');
      setSerialNumber('');
    }
    setErrors({});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Intake Toggle & Serial Number Setup */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div 
            className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${continuousIntake ? 'bg-[#961b2b]' : 'bg-gray-300'}`}
            onClick={() => setContinuousIntake(!continuousIntake)}
          >
            <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${continuousIntake ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Continuous Intake (Lock Details)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Bind to QR/Serial (Optional):</label>
          <input
            type="text"
            ref={serialInputRef}
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="e.g. SN-001"
            className="w-32 bg-white border border-[#e0e0e0] rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:border-[#961b2b] uppercase font-mono"
            autoFocus
          />
        </div>
      </div>
      
      {successToast && (
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 border border-emerald-200 flex items-center gap-2">
          <Check size={16} />
          {successToast}
        </div>
      )}

      {/* Top Section: Image + Name + Set + Category */}
      <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4">
        {/* Card Image */}
        <div className="space-y-1 flex-shrink-0">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center">
            Image
            {isAnalyzing && <span className="ml-1 text-[#961b2b] animate-pulse normal-case text-[10px]">...</span>}
          </label>
          <div className="w-full md:w-[120px] h-[120px] rounded bg-white border border-[#e0e0e0] flex items-center justify-center overflow-hidden relative group transition-all focus-within:border-[#961b2b]">
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <ImageIcon size={20} />
                <span className="text-[9px] uppercase font-semibold">Upload</span>
              </div>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-[#961b2b] animate-spin" />
              </div>
            )}
            {imageUrl && !isAnalyzing && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setImageUrl('');
                  setImageFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <Trash2 size={20} className="text-[#961b2b]" />
              </button>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              tabIndex={1}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>

      {/* Core Info Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-end">
        <div className="flex flex-col gap-1 sm:col-span-2 relative">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Item Name</label>
          <div className="relative">
            <input
              type="text"
              value={itemName}
              onChange={(e) => { 
                setItemName(e.target.value); 
                setShowSuggestions(true);
                clearError('itemName'); 
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              tabIndex={2}
              placeholder="e.g. Charizard ex"
              className={`w-full bg-white border ${errors.itemName ? '!border-[#961b2b]' : 'border-[#e0e0e0]'} rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#961b2b] transition-all block placeholder-gray-400`}
            />
            
            <AnimatePresence>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                >
                  {filteredSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-900 hover:bg-[#961b2b]/10 hover:text-[#961b2b] focus:bg-[#961b2b]/10 focus:text-[#961b2b] focus:outline-none transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="font-semibold">{suggestion.itemName}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-2">
                        <span>{suggestion.setName}</span>
                        {suggestion.cardNumber && <span>• {suggestion.cardNumber}</span>}
                        {suggestion.rarity && <span>• {suggestion.rarity}</span>}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {errors.itemName && <span className="absolute -bottom-4 right-0 text-[10px] font-bold text-[#961b2b]">REQUIRED</span>}
        </div>
        <div className={`flex flex-col gap-1 relative ${category === 'Sealed' ? 'sm:col-span-2' : ''}`}>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Set Name</label>
          <input
            type="text"
            value={cardSetName}
            onChange={(e) => { setCardSetName(e.target.value); clearError('cardSetName'); }}
            tabIndex={3}
            placeholder="e.g. 151, Obsidian Flames"
            className={`w-full bg-white border ${errors.cardSetName ? '!border-[#961b2b]' : 'border-[#e0e0e0]'} rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#961b2b] transition-all placeholder-gray-400`}
          />
          {errors.cardSetName && <span className="absolute -bottom-4 right-0 text-[10px] font-bold text-[#961b2b]">REQUIRED</span>}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Category</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            tabIndex={4}
            className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#961b2b] transition-all appearance-none"
          >
            <option value="Single">Raw Card</option>
            <option value="Slab">Graded Slab</option>
            <option value="Sealed">Sealed Product</option>
          </select>
        </div>
        {category === 'Sealed' && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Sealed Type</label>
            <select 
              value={sealedType}
              onChange={(e) => setSealedType(e.target.value)}
              tabIndex={5}
              className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#961b2b] transition-all appearance-none"
            >
              <option value="Sealed Box">Sealed Box</option>
              <option value="Sealed Case">Sealed Case</option>
              <option value="Sealed Promo/Single">Sealed Promo/Single</option>
            </select>
          </div>
        )}
      </div>
      </div>

      {/* Attribute Grid Row */}
      <div className={`grid grid-cols-2 ${!isBoxOrCase ? 'md:grid-cols-5' : 'md:grid-cols-2'} gap-4`}>
        {!isBoxOrCase && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => { setCardNumber(e.target.value.replace(/[^\d\/-]/g, '')); clearError('cardNumber'); }}
              tabIndex={6}
              placeholder="e.g. 199/165"
              className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#961b2b] transition-all placeholder-gray-400"
            />
          </div>
        )}
        {!isBoxOrCase && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Rarity</label>
            <input
              type="text"
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
              tabIndex={7}
              placeholder="e.g. SIR"
              className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#961b2b] transition-all placeholder-gray-400"
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Language</label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            tabIndex={8}
            className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#961b2b] transition-all appearance-none"
          >
            <option value="English">English</option>
            <option value="Japanese">Japanese</option>
            <option value="Indonesian">Indonesian</option>
            <option value="Traditional Chinese">Traditional Chinese</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 relative">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Condition</label>
          {category === 'Single' ? (
            <select 
              value={condition}
              onChange={(e) => { setCondition(e.target.value); clearError('condition'); }}
              tabIndex={9}
              className={`w-full bg-white border ${errors.condition ? '!border-[#961b2b]' : 'border-[#e0e0e0]'} rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#961b2b] transition-all appearance-none`}
            >
              <option value="NM">Near Mint (NM)</option>
              <option value="LP">Lightly Played (LP)</option>
              <option value="MP">Moderately Played (MP)</option>
              <option value="HP">Heavily Played (HP)</option>
              <option value="DMG">Damaged (DMG)</option>
            </select>
          ) : (
            <div className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm text-gray-400 cursor-not-allowed">
              N/A
            </div>
          )}
        </div>
        {!isBoxOrCase && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Foil Type</label>
            <select 
              value={foilType}
              onChange={(e) => setFoilType(e.target.value)}
              tabIndex={10}
              className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#961b2b] transition-all appearance-none"
            >
              <option value="Non-Foil">Non-Foil</option>
              <option value="Reverse Holo">Reverse Holo</option>
              <option value="Holo">Holo</option>
              <option value="Textured">Textured / Full Art</option>
              <option value="N/A">N/A</option>
            </select>
          </div>
        )}
      </div>

      {/* Conditional Slab Fields */}
      <AnimatePresence>
        {category === 'Slab' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 relative">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Grading Company</label>
                  <select 
                    value={gradingCompany}
                    onChange={(e) => { setGradingCompany(e.target.value); clearError('gradingCompany'); }}
                    tabIndex={10}
                    className={`w-full bg-white border ${errors.gradingCompany ? '!border-[#961b2b]' : 'border-[#e0e0e0]'} rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#961b2b] transition-all appearance-none`}
                  >
                    <option value="" disabled>Select...</option>
                    <option value="PSA">PSA</option>
                    <option value="BGS">BGS</option>
                    <option value="CGC">CGC</option>
                    <option value="SGC">SGC</option>
                    <option value="PCG">PCG</option>
                  </select>
                  {errors.gradingCompany && <span className="absolute -bottom-4 right-0 text-[10px] font-bold text-[#961b2b]">REQUIRED</span>}
                </div>
                <div className="flex flex-col gap-1 relative">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Grade</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => { setGrade(e.target.value.replace(/[^\d.]/g, '')); clearError('grade'); }}
                    tabIndex={11}
                    placeholder="e.g. 10, 9.5"
                    className={`w-full bg-white border ${errors.grade ? '!border-[#961b2b]' : 'border-[#e0e0e0]'} rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#961b2b] transition-all`}
                  />
                  {errors.grade && <span className="absolute -bottom-4 right-0 text-[10px] font-bold text-[#961b2b]">REQUIRED</span>}
                </div>
                <div className="flex flex-col gap-1 relative">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Cert Number</label>
                  <input
                    type="text"
                    value={certNumber}
                    onChange={(e) => { setCertNumber(e.target.value.replace(/\D/g, '')); clearError('certNumber'); }}
                    tabIndex={12}
                    placeholder="e.g. 84729104"
                    className={`w-full bg-white border ${errors.certNumber ? '!border-[#961b2b]' : 'border-[#e0e0e0]'} rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#961b2b] transition-all font-mono`}
                  />
                  {errors.certNumber && <span className="absolute -bottom-4 right-0 text-[10px] font-bold text-[#961b2b]">REQUIRED</span>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#e0e0e0] pt-4">
        <div className="flex flex-col gap-1 relative">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Cost Basis (Amt Paid)</label>
          <CurrencyInput 
            value={costBasis} 
            onChange={(val) => { setCostBasis(val); clearError('costBasis'); }} 
            tabIndex={13} 
            onKeyDown={handleKeyDown}
            className={`w-full bg-white border ${errors.costBasis ? '!border-[#961b2b]' : 'border-[#e0e0e0]'} rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#961b2b] transition-all`}
          />
          {errors.costBasis && <span className="absolute -bottom-4 right-0 text-[10px] font-bold text-[#961b2b]">REQUIRED</span>}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Supplier / Seller</label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            onKeyDown={handleKeyDown}
            tabIndex={14}
            placeholder="Walk-in, Distributor, etc."
            className="w-full bg-white border border-[#e0e0e0] rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#961b2b] transition-all"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button 
          onClick={handleSubmit}
          tabIndex={15}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-[#961b2b] text-gray-100 rounded hover:bg-[#961b2b]/90 transition-all"
        >
          <Plus size={16} />
          Add to Inventory
        </button>
      </div>
    </div>
  );
}
