import React, { useState, useEffect } from 'react';
import {
  Barcode as BarcodeIcon,
  Printer,
  Search,
  Package,
  Sliders,
  RefreshCw,
  Layers,
  CheckCircle,
  Copy,
  Tag,
} from 'lucide-react';
import posService from '../../services/posService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SearchableSelect from '../../components/ui/SearchableSelect';

export const BarcodePrint = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form controls
  const [barcodeText, setBarcodeText] = useState('');
  const [format, setFormat] = useState('CODE128');
  const [copies, setCopies] = useState(12);
  const [labelSize, setLabelSize] = useState('50x25'); // 50x25, 40x30, 35x25, 100x50, a4-24
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showSku, setShowSku] = useState(true);
  const [barcodeSvg, setBarcodeSvg] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await posService.getProducts({ per_page: 50 });
      const list = res.data?.data || res.data || [];
      setProducts(list);
      if (list.length > 0) {
        selectProduct(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch products for barcode:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectProduct = (prod) => {
    setSelectedProduct(prod);
    const code = prod.barcode || prod.sku || `PROD-${prod.id}`;
    setBarcodeText(code);
    generateBarcodeCode(code, format);
  };

  const generateBarcodeCode = async (text, barcodeFormat) => {
    try {
      setGenerating(true);
      const res = await posService.generateBarcode({
        text: text || 'ERP123456',
        format: barcodeFormat || 'CODE128',
      });
      if (res.svg) {
        setBarcodeSvg(res.svg);
      }
    } catch (err) {
      console.error('Barcode generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleFormatChange = (newFormat) => {
    setFormat(newFormat);
    generateBarcodeCode(barcodeText, newFormat);
  };

  const handleBarcodeChange = (val) => {
    setBarcodeText(val);
    generateBarcodeCode(val, format);
  };

  const filteredProducts = products.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      p.barcode?.toLowerCase().includes(term)
    );
  });

  const getLabelClass = () => {
    switch (labelSize) {
      case '40x30':
        return 'w-[150px] h-[110px] p-2';
      case '35x25':
        return 'w-[130px] h-[95px] p-1.5';
      case '100x50':
        return 'w-[280px] h-[150px] p-4';
      case '50x25':
      default:
        return 'w-[180px] h-[105px] p-2';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarcodeIcon className="w-5 h-5 text-teal-600" />
            Barcode Label Generator & Print
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate Code128, EAN13, EAN8, UPC barcode label sheets for standard thermal label printers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => window.print()}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Barcode Sheet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Selection & Print Options */}
        <div className="space-y-6">
          {/* Product Selector */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Select Product</h3>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, SKU or barcode..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-teal-500"
              />
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-lg">
              {filteredProducts.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProduct(p)}
                    className={`w-full text-left p-2.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected ? 'bg-teal-50/80 text-teal-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        SKU: {p.sku || 'N/A'} • ₹{Number(p.selling_price || p.price || 0).toFixed(2)}
                      </div>
                    </div>
                    {isSelected && <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">No products found.</div>
              )}
            </div>
          </Card>

          {/* Barcode & Label Settings */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs space-y-4 !overflow-visible">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Label Specifications</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode String</label>
              <input
                type="text"
                value={barcodeText}
                onChange={(e) => handleBarcodeChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:outline-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 !overflow-visible">
              <div className="z-20">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode Format</label>
                <SearchableSelect
                  options={[
                    { value: 'CODE128', label: 'Code 128 (Standard)' },
                    { value: 'EAN13', label: 'EAN-13 (13 Digits)' },
                    { value: 'EAN8', label: 'EAN-8 (8 Digits)' },
                    { value: 'UPC', label: 'UPC-A (12 Digits)' }
                  ]}
                  value={format}
                  onChange={(val) => handleFormatChange(val)}
                  searchable={false}
                />
              </div>

              <div className="z-10">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Thermal Label Size</label>
                <SearchableSelect
                  options={[
                    { value: '50x25', label: '50mm x 25mm (Standard)' },
                    { value: '40x30', label: '40mm x 30mm (Compact)' },
                    { value: '35x25', label: '35mm x 25mm (Jewelry/Small)' },
                    { value: '100x50', label: '100mm x 50mm (Large / Box)' },
                    { value: 'a4-24', label: 'A4 Sheet (24-up grid)' }
                  ]}
                  value={labelSize}
                  onChange={(val) => setLabelSize(val)}
                  searchable={false}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Labels to Print ({copies})</label>
              <div className="flex items-center gap-2">
                {[6, 12, 24, 48].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCopies(c)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold border ${
                      copies === c
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={copies}
                  onChange={(e) => setCopies(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-slate-200 rounded text-xs text-center font-bold"
                />
              </div>
            </div>

            {/* Field Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProductName}
                  onChange={(e) => setShowProductName(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-700">Show Product Title</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-700">Show Retail Selling Price (₹)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSku}
                  onChange={(e) => setShowSku(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-700">Show Product SKU / Barcode text</span>
              </label>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Printable Sheet Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-600" />
                Print Preview Sheet ({copies} Labels • {labelSize})
              </h3>
              <span className="text-xs text-slate-400">Scale 100% • Thermal Direct</span>
            </div>

            {/* Print Sheet Container */}
            <div className="print-area bg-slate-50/70 p-6 rounded-xl border border-slate-200 min-h-[450px] overflow-y-auto">
              <div className="flex flex-wrap gap-3 justify-start">
                {Array.from({ length: copies }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`bg-white border border-dashed border-slate-300 rounded shadow-2xs flex flex-col items-center justify-between text-center select-none ${getLabelClass()}`}
                  >
                    {/* Brand / Store header */}
                    <div className="text-[9px] font-bold text-slate-800 tracking-wider uppercase truncate w-full">
                      DREAMS ENTERPRISE
                    </div>

                    {/* Product Name */}
                    {showProductName && (
                      <div className="text-[10px] font-semibold text-slate-900 truncate w-full px-1">
                        {selectedProduct?.name || 'Standard Retail Product'}
                      </div>
                    )}

                    {/* Barcode graphic */}
                    <div className="my-1 flex justify-center items-center w-full px-1">
                      {barcodeSvg ? (
                        <div
                          className="max-h-9 max-w-full flex items-center justify-center overflow-hidden [&>svg]:max-h-8 [&>svg]:w-auto"
                          dangerouslySetInnerHTML={{ __html: barcodeSvg }}
                        />
                      ) : (
                        <div className="w-32 h-7 bg-slate-100 flex items-center justify-center font-mono text-[9px] text-slate-400">
                          ||| ||||| ||||| |||
                        </div>
                      )}
                    </div>

                    {/* Code & Price */}
                    <div className="w-full flex items-center justify-between px-1 text-[9px] font-mono text-slate-600">
                      {showSku && <span>{barcodeText || selectedProduct?.sku || 'SKU-001'}</span>}
                      {showPrice && (
                        <span className="font-bold text-slate-900">
                          ₹{Number(selectedProduct?.selling_price || selectedProduct?.price || 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Print Hints */}
            <div className="mt-4 p-3 bg-teal-50/80 rounded-lg text-[11px] text-teal-800 flex items-center justify-between">
              <span>
                💡 Tip: When the system print dialog opens, set Paper Size to your roll size and Margins to None.
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Print {copies} Labels
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BarcodePrint;
