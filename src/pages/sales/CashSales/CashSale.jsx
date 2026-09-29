import React, { useState, useEffect } from 'react';
import {
  Banknote,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Printer,
  CreditCard,
  QrCode,
  DollarSign,
  User,
  Package,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import productService from '../../../services/productService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

export const CashSale = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchProduct, setSearchProduct] = useState('');

  // Cart State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const [recentSales, setRecentSales] = useState([]);

  // Receipt Modal
  const [completedSale, setCompletedSale] = useState(null);

  useEffect(() => {
    loadData();
    fetchRecentSales();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, custRes] = await Promise.all([
        productService.getProducts({ per_page: 150 }).catch(() => ({ data: [] })),
        salesService.getCustomers({ per_page: 50 }).catch(() => ({ data: [] })),
      ]);
      const pList = prodRes.data?.data || prodRes.data || [];
      setProducts(Array.isArray(pList) ? pList : (pList.data || []));

      const cList = custRes.data?.data?.data || custRes.data?.data || custRes.data || [];
      setCustomers(cList);
      if (cList.length > 0) setSelectedCustomerId(cList[0].id);
    } catch (err) {
      console.error('Failed to load POS data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentSales = async () => {
    try {
      const res = await salesService.getCashSales({ per_page: 5 });
      const payload = res.data?.data || res.data;
      setRecentSales(payload.data || payload || []);
    } catch (err) {
      console.error('Failed to load recent cash sales:', err);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.product_id === product.id);
    const price = Number(product.selling_price || product.price || product.mrp || 0);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          sku: product.sku || '',
          price,
          quantity: 1,
          discount: 0,
          tax: 0,
          subtotal: price,
        },
      ]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, subtotal: newQty * item.price }
              : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const tax = subtotal * 0.18; // Standard GST 18%
  const grandTotal = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setProcessing(true);
      const payload = {
        customer_id: selectedCustomerId || null,
        payment_method: paymentMethod,
        paid_amount: grandTotal,
        subtotal,
        tax,
        grand_total: grandTotal,
        items: cart.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          price: it.price,
          tax: 0,
          subtotal: it.subtotal,
        })),
      };

      const res = await salesService.createCashSale(payload);
      setCompletedSale(res.data?.data || { ...payload, sale_number: `CS-${Date.now().toString().slice(-6)}` });
      setCart([]);
      fetchRecentSales();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing cash sale checkout.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Banknote className="w-7 h-7 text-emerald-600" />
            Cash Sales & POS Register
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Instant point-of-sale checkout with real-time stock deduction and automatic receipt generation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Catalog / Quick Picker */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or barcode..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[550px] overflow-y-auto p-1">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">{p.sku || 'SKU'}</span>
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-2 mt-0.5">
                    {p.name}
                  </h4>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    ₹{Number(p.selling_price || p.price || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                    Stock: {p.current_stock ?? p.stock ?? '✓'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Register / Cart Panel */}
        <div className="space-y-4">
          <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)
                </h3>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-xs text-rose-500 hover:underline">
                    Clear
                  </button>
                )}
              </div>

              {/* Customer Selector */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="">Walk-in Retail Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-400 py-10 text-center">Cart is empty. Click products to add.</p>
                ) : (
                  cart.map((it) => (
                    <div
                      key={it.product_id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                    >
                      <div className="max-w-[140px] truncate">
                        <p className="font-semibold text-slate-800 dark:text-white truncate">{it.name}</p>
                        <span className="text-slate-400">₹{it.price} each</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(it.product_id, -1)}
                          className="w-5 h-5 rounded bg-white dark:bg-slate-700 border flex items-center justify-center text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold w-5 text-center">{it.quantity}</span>
                        <button
                          onClick={() => updateQuantity(it.product_id, 1)}
                          className="w-5 h-5 rounded bg-white dark:bg-slate-700 border flex items-center justify-center text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{Number(it.subtotal).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Checkout Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 mt-4">
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18% GST):</span>
                  <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t">
                  <span>Payable:</span>
                  <span className="text-emerald-600">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['cash', 'card', 'upi', 'bank_transfer'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 text-[11px] font-semibold rounded-lg uppercase transition-all ${
                        paymentMethod === m
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {m === 'bank_transfer' ? 'Bank' : m}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                disabled={cart.length === 0 || processing}
                onClick={handleCheckout}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {processing ? 'Processing Sale...' : `Charge ₹${grandTotal.toLocaleString('en-IN')}`}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Cash Sales */}
      {recentSales.length > 0 && (
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs uppercase font-bold text-slate-400 mb-3">Recent POS Transactions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {recentSales.map((s) => (
              <div key={s.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-indigo-600">{s.cash_sale_number || s.sale_number}</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                  {s.customer?.name || 'Walk-in'}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[11px] capitalize text-slate-400">{s.payment_method}</span>
                  <span className="font-bold text-emerald-600">₹{Number(s.grand_total || s.total || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sale Completed!</h3>
            <p className="text-xs text-slate-500">
              Transaction reference: <span className="font-mono font-bold text-slate-800 dark:text-white">{completedSale.cash_sale_number || completedSale.sale_number}</span>
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-left text-xs space-y-1">
              <div className="flex justify-between font-bold">
                <span>Amount Paid:</span>
                <span className="text-emerald-600">₹{Number(completedSale.grand_total || completedSale.total || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Method:</span>
                <span className="capitalize">{completedSale.payment_method}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Stock Movement:</span>
                <span className="text-indigo-600 font-semibold">Immediate Deduct (SALE)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
                <Printer className="w-4 h-4" /> Print
              </Button>
              <Button variant="primary" className="flex-1 bg-emerald-600 text-white" onClick={() => setCompletedSale(null)}>
                Next Sale
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashSale;
