import React, { useState, useEffect } from 'react';
import {
  QrCode as QrCodeIcon,
  Printer,
  Search,
  Layers,
  CheckCircle,
  Copy,
  Tag,
  ExternalLink,
  Receipt,
  Package,
} from 'lucide-react';
import posService from '../../services/posService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export const QRCodePrint = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // QR Mode: 'product_sku' | 'product_url' | 'pos_order' | 'invoice' | 'custom'
  const [qrMode, setQrMode] = useState('product_sku');
  const [qrText, setQrText] = useState('PROD-SKU-1001');
  const [labelTitle, setLabelTitle] = useState('Scan for Details');
  const [qrSize, setQrSize] = useState('medium'); // small, medium, large
  const [copies, setCopies] = useState(6);
  const [labelFormat, setLabelFormat] = useState('grid'); // 'single', 'grid', 'compact'
  const [showPrice, setShowPrice] = useState(true);
  const [qrSvg, setQrSvg] = useState('');
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
        handleProductSelect(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch products for QR:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (prod) => {
    setSelectedProduct(prod);
    updateQrPayload(qrMode, prod);
  };

  const updateQrPayload = (mode, prod = selectedProduct) => {
    let payload = '';
    let title = '';
    if (mode === 'product_sku') {
      payload = prod ? prod.sku || `SKU-${prod.id}` : 'SKU-001';
      title = prod?.name || 'Product SKU';
    } else if (mode === 'product_url') {
      payload = `https://store.erp.com/products/${prod?.sku || 'sku-001'}`;
      title = `${prod?.name || 'Product'} URL`;
    } else if (mode === 'pos_order') {
      payload = `POS-${new Date().getFullYear()}-000124`;
      title = 'POS Order Check';
    } else if (mode === 'invoice') {
      payload = `INV-${new Date().getFullYear()}-000452`;
      title = 'GST e-Invoice QR';
    } else if (mode === 'upi') {
      payload = `upi://pay?pa=dreamserp@upi&pn=DreamsERP&mc=5411&cu=INR`;
      title = 'Scan & Pay UPI';
    } else {
      payload = qrText;
      title = 'Custom QR Code';
    }

    setQrText(payload);
    setLabelTitle(title);
    fetchQrSvg(payload);
  };

  const fetchQrSvg = async (text) => {
    try {
      setGenerating(true);
      const res = await posService.generateQr({
        text: text || 'ERP-QR',
        size: qrSize === 'large' ? 240 : qrSize === 'small' ? 120 : 180,
      });
      if (res.svg) {
        setQrSvg(res.svg);
      }
    } catch (err) {
      console.error('QR generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleModeChange = (newMode) => {
    setQrMode(newMode);
    updateQrPayload(newMode);
  };

  const handleTextChange = (val) => {
    setQrText(val);
    fetchQrSvg(val);
  };

  const filteredProducts = products.filter((p) => {
    const term = search.toLowerCase();
    return p.name?.toLowerCase().includes(term) || p.sku?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <QrCodeIcon className="w-5 h-5 text-teal-600" />
            QR Code Generator & Print
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate 2D QR Code labels for Products, URLs, POS Orders, Invoices, and UPI payments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => window.print()}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print QR Sheet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: QR Configuration */}
        <div className="space-y-6">
          {/* Target Mode */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">1. Select Target Type</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'product_sku', label: 'Product SKU', icon: Package },
                { id: 'product_url', label: 'Product URL', icon: ExternalLink },
                { id: 'pos_order', label: 'POS Order', icon: Receipt },
                { id: 'invoice', label: 'Invoice QR', icon: Tag },
                { id: 'upi', label: 'UPI Pay Link', icon: CheckCircle },
                { id: 'custom', label: 'Custom Payload', icon: QrCodeIcon },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = qrMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModeChange(m.id)}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 text-left font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* If product mode, show product search */}
            {(qrMode === 'product_sku' || qrMode === 'product_url') && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product</label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product..."
                    className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-teal-500"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProductSelect(p)}
                      className={`w-full text-left p-2 text-xs flex justify-between items-center ${
                        selectedProduct?.id === p.id ? 'bg-teal-50 font-bold text-teal-900' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate mr-2">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">₹{Number(p.selling_price || p.price || 0).toFixed(0)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QR Content String */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">QR Encoded Payload</label>
              <textarea
                rows="2"
                value={qrText}
                onChange={(e) => handleTextChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:outline-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Label Caption</label>
              <input
                type="text"
                value={labelTitle}
                onChange={(e) => setLabelTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-teal-500"
              />
            </div>
          </Card>

          {/* Size & Layout */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2. Layout & Print Settings</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">QR Matrix Size</label>
                <select
                  value={qrSize}
                  onChange={(e) => {
                    setQrSize(e.target.value);
                    fetchQrSvg(qrText);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                >
                  <option value="small">Small (120px)</option>
                  <option value="medium">Medium (180px)</option>
                  <option value="large">Large (240px)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Layout Format</label>
                <select
                  value={labelFormat}
                  onChange={(e) => setLabelFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                >
                  <option value="grid">Grid (Shelf Tags)</option>
                  <option value="compact">Compact Stickers</option>
                  <option value="single">Single Stand Badge</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Labels ({copies})</label>
              <div className="flex items-center gap-2">
                {[1, 4, 8, 16, 24].map((c) => (
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
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-700">Display Retail Price / Info</span>
              </label>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Printable QR Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <QrCodeIcon className="w-4 h-4 text-teal-600" />
                Live QR Print Sheet Preview ({copies} Labels)
              </h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Sheet
              </Button>
            </div>

            {/* Printable Preview Container */}
            <div className="print-area bg-slate-50/70 p-6 rounded-xl border border-slate-200 min-h-[460px] overflow-y-auto">
              <div
                className={`grid gap-4 ${
                  labelFormat === 'single'
                    ? 'grid-cols-1 max-w-sm mx-auto'
                    : labelFormat === 'compact'
                    ? 'grid-cols-2 sm:grid-cols-4'
                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                }`}
              >
                {Array.from({ length: copies }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-dashed border-slate-300 rounded-lg p-3 flex flex-col items-center justify-between text-center shadow-2xs"
                  >
                    {/* Header */}
                    <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider truncate w-full">
                      DREAMS ENTERPRISE
                    </div>

                    {/* QR SVG */}
                    <div className="my-2 p-2 bg-white rounded flex items-center justify-center">
                      {qrSvg ? (
                        <div
                          className="w-28 h-28 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                          dangerouslySetInnerHTML={{ __html: qrSvg }}
                        />
                      ) : (
                        <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                          Loading QR...
                        </div>
                      )}
                    </div>

                    {/* Caption */}
                    <div className="text-[11px] font-bold text-slate-800 truncate w-full">
                      {labelTitle}
                    </div>

                    {/* Encoded payload sample */}
                    <div className="text-[9px] font-mono text-slate-500 truncate w-full mt-0.5">
                      {qrText}
                    </div>

                    {/* Price if enabled */}
                    {showPrice && selectedProduct && (
                      <div className="mt-1 pt-1 border-t border-slate-100 w-full text-[10px] font-bold text-teal-700">
                        MRP: ₹{Number(selectedProduct.selling_price || selectedProduct.price || 0).toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRCodePrint;
