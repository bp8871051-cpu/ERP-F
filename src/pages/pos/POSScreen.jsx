import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Wallet,
  ArrowRight,
  Printer,
  X,
  UserPlus,
  User,
  Package,
  Layers,
  Sparkles,
  QrCode,
  RotateCcw,
  Receipt,
  Download,
  Share2,
  Send,
  MessageCircle,
  Store,
} from 'lucide-react';
import posService from '../../services/posService';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export const POSScreen = () => {
  const navigate = useNavigate();

  // State: Products & Filters
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  // State: Cart
  const [cart, setCart] = useState([]);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [calculatedTotals, setCalculatedTotals] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    round_off: 0,
    grand_total: 0,
    final_amount: 0,
  });
  const [isCalculating, setIsCalculating] = useState(false);

  // State: Customer
  const [customerType, setCustomerType] = useState('walk_in'); // 'walk_in' or 'existing'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // State: Payment Modal & Methods
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash', 'card', 'upi', 'mixed', etc.
  const [mixedPayments, setMixedPayments] = useState({
    cash: 0,
    card: 0,
    upi: 0,
    bank_transfer: 0,
  });
  const [paymentReference, setPaymentReference] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // State: Receipt Modal
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch products
  const fetchProducts = async (search = '', catId = '') => {
    try {
      setLoadingProducts(true);
      const params = {};
      if (search) params.search = search;
      if (catId) params.category_id = catId;
      params.per_page = 40;

      const res = await posService.getProducts(params);
      const items = res.data?.data || [];
      setProducts(items);

      // Extract unique categories
      const catsMap = new Map();
      items.forEach((p) => {
        if (p.category) {
          catsMap.set(p.category.id, p.category.name);
        }
      });
      setCategories(Array.from(catsMap.entries()).map(([id, name]) => ({ id, name })));
    } catch (err) {
      console.error('Error fetching POS products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchQuery, selectedCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Recalculate cart totals on backend whenever cart or order discount changes
  useEffect(() => {
    if (cart.length === 0) {
      setCalculatedTotals({
        subtotal: 0,
        discount: 0,
        tax: 0,
        round_off: 0,
        grand_total: 0,
        final_amount: 0,
      });
      return;
    }

    const calculateOnBackend = async () => {
      try {
        setIsCalculating(true);
        const payload = {
          items: cart.map((i) => ({
            product_id: i.id,
            quantity: i.quantity,
            discount: i.discount || 0,
          })),
          discount: Number(orderDiscount) || 0,
        };
        const res = await posService.calculateTotals(payload);
        if (res.data) {
          setCalculatedTotals(res.data);
          // Auto initialize mixed payments
          setMixedPayments((prev) => ({
            ...prev,
            cash: res.data.final_amount,
            card: 0,
            upi: 0,
            bank_transfer: 0,
          }));
        }
      } catch (err) {
        console.error('Calculation error:', err);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateOnBackend();
  }, [cart, orderDiscount]);

  // Add product to cart
  const addToCart = (product) => {
    if (product.available_stock <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.available_stock) {
          showNotification(`Maximum available stock reached for ${product.name}`, 'warning');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: Number(product.selling_price || 0),
          tax_rate: Number(product.tax_rate || 0),
          discount: 0,
          quantity: 1,
          available_stock: product.available_stock,
          image: product.image,
        },
      ];
    });
  };

  // Cart quantity controls
  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty > item.available_stock) {
              showNotification(`Only ${item.available_stock} units in stock.`, 'warning');
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setOrderDiscount(0);
  };

  const showNotification = (msg, type = 'info') => {
    setStatusMessage({ text: msg, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Validate and submit checkout
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      showNotification('Cart is empty. Add products before checkout.', 'warning');
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleExecuteCheckout = async () => {
    try {
      setIsSubmittingOrder(true);

      // Build payment tender list
      let paymentsList = [];
      if (paymentMode === 'mixed') {
        const sum =
          Number(mixedPayments.cash || 0) +
          Number(mixedPayments.card || 0) +
          Number(mixedPayments.upi || 0) +
          Number(mixedPayments.bank_transfer || 0);

        if (sum < calculatedTotals.final_amount) {
          showNotification(
            `Total tendered (₹${sum}) is less than required ₹${calculatedTotals.final_amount}`,
            'error'
          );
          setIsSubmittingOrder(false);
          return;
        }

        if (mixedPayments.cash > 0)
          paymentsList.push({ payment_method: 'cash', amount: Number(mixedPayments.cash) });
        if (mixedPayments.card > 0)
          paymentsList.push({
            payment_method: 'card',
            amount: Number(mixedPayments.card),
            card_last4: cardLast4,
          });
        if (mixedPayments.upi > 0)
          paymentsList.push({
            payment_method: 'upi',
            amount: Number(mixedPayments.upi),
            reference_no: paymentReference,
          });
        if (mixedPayments.bank_transfer > 0)
          paymentsList.push({
            payment_method: 'bank_transfer',
            amount: Number(mixedPayments.bank_transfer),
            reference_no: paymentReference,
          });
      } else {
        paymentsList = [
          {
            payment_method: paymentMode,
            amount: calculatedTotals.final_amount,
            reference_no: paymentReference || undefined,
            card_last4: cardLast4 || undefined,
          },
        ];
      }

      const payload = {
        warehouse_id: 1,
        customer_name: customerName || (customerType === 'walk_in' ? 'Walk-in Customer' : ''),
        customer_phone: customerPhone || undefined,
        customer_email: customerEmail || undefined,
        discount: Number(orderDiscount) || 0,
        items: cart.map((i) => ({
          product_id: i.id,
          quantity: i.quantity,
          discount: i.discount || 0,
        })),
        payments: paymentsList,
        notes: `POS Terminal checkout • ${paymentMode.toUpperCase()}`,
      };

      const res = await posService.checkout(payload);

      if (res.status === 'success') {
        setReceiptData(res.data.receipt);
        setOrderSuccess(res.data.order);
        setShowCheckoutModal(false);
        setShowReceiptModal(true);
        clearCart();
        // Refresh product stocks
        fetchProducts(searchQuery, selectedCategory);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || err.message || 'Checkout failed. Please check payment and stock.';
      showNotification(msg, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-6 bg-slate-100 overflow-hidden select-none">
      {/* Top Banner & Quick Controls */}
      <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 p-1.5 rounded-lg text-white">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide">POS TERMINAL #01</span>
            <span className="text-[11px] text-teal-400 font-mono ml-2">● LIVE CONNECTED</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <div
              className={`px-3 py-1 rounded text-xs font-medium animate-fade-in ${
                statusMessage.type === 'error'
                  ? 'bg-rose-500 text-white'
                  : statusMessage.type === 'warning'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <Button
            variant="secondary"
            size="xs"
            icon={Receipt}
            onClick={() => navigate('/app/pos/orders')}
            className="text-slate-300 hover:text-white"
          >
            Order History
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/app/pos')}
            className="text-slate-400 hover:text-white"
          >
            Exit Terminal
          </Button>
        </div>
      </div>

      {/* Main Grid: LEFT (Catalog) / RIGHT (Cart & Pay) */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========================================================
            LEFT COLUMN: CATALOG, SEARCH, FILTERS, PRODUCT GRID
            ======================================================== */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden border-r border-slate-200/80">
          {/* Search bar & Category Pills */}
          <div className="space-y-3 shrink-0 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search products by Name, SKU, or scan Barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category selection pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === ''
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-1">
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse p-3" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Package className="w-12 h-12 stroke-1 mb-2" />
                <p className="text-sm font-medium">No matching products found</p>
                <p className="text-xs">Try searching with a different SKU or product title</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {products.map((product) => {
                  const inStock = product.available_stock > 0;
                  return (
                    <motion.div
                      key={product.id}
                      whileHover={inStock ? { scale: 1.015 } : {}}
                      whileTap={inStock ? { scale: 0.98 } : {}}
                      onClick={() => addToCart(product)}
                      className={`bg-white rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                        inStock
                          ? 'border-slate-200/80 hover:border-teal-500 hover:shadow-md'
                          : 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[100px]">
                          {product.sku || 'SKU'}
                        </span>
                        {inStock ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {product.available_stock} in stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-teal-700 transition-colors">
                        {product.name}
                      </h4>

                      {/* Price & Add Action */}
                      <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{Number(product.selling_price || 0).toLocaleString()}
                          </span>
                          {product.mrp && Number(product.mrp) > Number(product.selling_price) && (
                            <span className="text-[10px] text-slate-400 line-through ml-1">
                              ₹{Number(product.mrp).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <button
                          disabled={!inStock}
                          className={`p-1.5 rounded-lg transition-colors ${
                            inStock
                              ? 'bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: CART, CUSTOMER SELECTOR, SUMMARY & PAY
            ======================================================== */}
        <div className="w-[420px] bg-white flex flex-col justify-between shrink-0 shadow-lg border-l border-slate-200 z-10">
          {/* Cart Header */}
          <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Cart Items ({cart.reduce((sum, i) => sum + i.quantity, 0)})
              </span>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-medium text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Customer Selection Quick Bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/30 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Customer</span>
              <div className="flex items-center gap-2 text-xs">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="custType"
                    checked={customerType === 'walk_in'}
                    onChange={() => {
                      setCustomerType('walk_in');
                      setCustomerName('');
                      setCustomerPhone('');
                    }}
                    className="text-teal-600 text-xs"
                  />
                  <span className="text-[11px]">Walk-in</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="custType"
                    checked={customerType === 'existing'}
                    onChange={() => setCustomerType('existing')}
                    className="text-teal-600 text-xs"
                  />
                  <span className="text-[11px]">Register Customer</span>
                </label>
              </div>
            </div>

            {customerType === 'existing' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="text"
                  placeholder="Phone (e.g. 9876543210)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          {/* Scrollable Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <ShoppingCart className="w-10 h-10 stroke-1 mb-2 text-slate-300" />
                <p className="text-xs font-semibold">Your POS Cart is Empty</p>
                <p className="text-[11px] text-slate-400 text-center mt-1">
                  Click on any product card from the left catalog to add to bill
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.name}</p>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>₹{item.price.toLocaleString()}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-slate-400">SKU: {item.sku}</span>
                      </div>
                    </div>

                    {/* Qty +/- */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="text-right shrink-0 w-16">
                      <p className="font-extrabold text-slate-900">₹{lineTotal.toLocaleString()}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[10px] text-rose-500 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Financial Summary & Checkout Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2.5">
            {/* Quick Discount Field */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Order Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={orderDiscount}
                onChange={(e) => setOrderDiscount(Math.max(0, Number(e.target.value)))}
                className="w-24 text-right px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">₹{calculatedTotals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span className="font-mono">-₹{calculatedTotals.discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST 18%):</span>
                <span className="font-mono">₹{calculatedTotals.tax.toLocaleString()}</span>
              </div>
              {calculatedTotals.round_off !== 0 && (
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Round Off:</span>
                  <span className="font-mono">
                    {calculatedTotals.round_off > 0 ? '+' : ''}₹{calculatedTotals.round_off}
                  </span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="pt-2 border-t border-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Net Payable</span>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  ₹{calculatedTotals.final_amount.toLocaleString()}
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                disabled={cart.length === 0 || isCalculating}
                onClick={handleProceedToCheckout}
                className="bg-teal-700 hover:bg-teal-800 text-white px-6 shadow-md"
              >
                Proceed to Pay <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: CHECKOUT & PAYMENT METHOD SELECTOR
          ======================================================== */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">POS Checkout & Payment Tender</h3>
                  <p className="text-xs text-teal-400">Total Bill Amount: ₹{calculatedTotals.final_amount.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Payment Mode Picker */}
              <div className="p-5 space-y-4">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Select Payment Tender:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Cash Tender', icon: Banknote },
                    { id: 'card', label: 'Credit / Debit', icon: CreditCard },
                    { id: 'upi', label: 'UPI / QR Code', icon: Smartphone },
                    { id: 'bank_transfer', label: 'Bank UTR', icon: Building },
                    { id: 'wallet', label: 'Store Wallet', icon: Wallet },
                    { id: 'mixed', label: 'Mixed Split', icon: Sparkles },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMode(m.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Conditional Fields based on Tender */}
                {paymentMode === 'card' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Card Last 4 Digits:</label>
                    <input
                      type="text"
                      maxLength="4"
                      placeholder="e.g. 4829"
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>
                )}

                {(paymentMode === 'upi' || paymentMode === 'bank_transfer') && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Transaction UTR / Reference ID:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI-2026-981240"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>
                )}

                {paymentMode === 'mixed' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <span className="text-xs font-semibold text-slate-700">Split Payment Amounts:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-slate-500">Cash Amount (₹):</label>
                        <input
                          type="number"
                          value={mixedPayments.cash}
                          onChange={(e) =>
                            setMixedPayments({ ...mixedPayments, cash: Number(e.target.value) })
                          }
                          className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500">Card Amount (₹):</label>
                        <input
                          type="number"
                          value={mixedPayments.card}
                          onChange={(e) =>
                            setMixedPayments({ ...mixedPayments, card: Number(e.target.value) })
                          }
                          className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500">UPI Amount (₹):</label>
                        <input
                          type="number"
                          value={mixedPayments.upi}
                          onChange={(e) =>
                            setMixedPayments({ ...mixedPayments, upi: Number(e.target.value) })
                          }
                          className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500">Bank Transfer (₹):</label>
                        <input
                          type="number"
                          value={mixedPayments.bank_transfer}
                          onChange={(e) =>
                            setMixedPayments({ ...mixedPayments, bank_transfer: Number(e.target.value) })
                          }
                          className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 text-xs flex items-center justify-between text-teal-900">
                  <span>Customer:</span>
                  <span className="font-bold">{customerName || 'Walk-in Customer'}</span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={isSubmittingOrder}
                  onClick={handleExecuteCheckout}
                  className="bg-teal-700 hover:bg-teal-800 text-white px-8"
                >
                  {isSubmittingOrder ? 'Processing...' : 'Complete Sale & Print'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          MODAL: THERMAL 58mm / 80mm POS RECEIPT PREVIEW
          ======================================================== */}
      <AnimatePresence>
        {showReceiptModal && receiptData && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
            >
              {/* Top controls */}
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  POS Order Receipt
                </span>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Thermal Receipt Paper Style */}
              <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 space-y-3 bg-white border-b border-slate-200">
                <div className="text-center space-y-1">
                  <h2 className="font-bold text-sm text-slate-900">{receiptData.company.name}</h2>
                  <p className="text-[10px] text-slate-500">{receiptData.company.address}</p>
                  <p className="text-[10px] text-slate-500">GSTIN: {receiptData.company.gstin}</p>
                  <p className="text-[10px] text-slate-500">Phone: {receiptData.company.phone}</p>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-2 text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Order #:</span>
                    <span className="font-bold">{receiptData.order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{receiptData.order.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{receiptData.order.cashier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{receiptData.order.customer}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1.5">
                  {receiptData.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[11px]">
                      <div className="space-y-0.5 max-w-[190px]">
                        <p className="font-semibold">{it.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {it.quantity} x ₹{it.unit_price}
                        </p>
                      </div>
                      <span className="font-bold">₹{it.total}</span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{receiptData.summary.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{receiptData.summary.discount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>₹{receiptData.summary.tax}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                    <span>GRAND TOTAL:</span>
                    <span>₹{receiptData.summary.grand_total}</span>
                  </div>
                </div>

                {/* Payments */}
                <div className="border-t border-dashed border-slate-300 pt-2 text-[10px] space-y-0.5">
                  {receiptData.payments.map((p, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>Tendered ({p.method}):</span>
                      <span>₹{p.amount}</span>
                    </div>
                  ))}
                  {receiptData.summary.change_amount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Change Due:</span>
                      <span>₹{receiptData.summary.change_amount}</span>
                    </div>
                  )}
                </div>

                {/* Footer Message */}
                <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 space-y-1">
                  <p>{receiptData.settings.thank_you_message}</p>
                  <p>{receiptData.settings.footer_text}</p>
                </div>
              </div>

              {/* Receipt Action Buttons */}
              <div className="p-3 bg-slate-50 grid grid-cols-3 gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Printer}
                  onClick={() => window.print()}
                  className="bg-teal-700 hover:bg-teal-800 text-white"
                >
                  Print
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Download}
                  onClick={() => showNotification('Receipt PDF downloaded successfully.', 'success')}
                >
                  PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={MessageCircle}
                  onClick={() => showNotification('Receipt dispatched to WhatsApp.', 'success')}
                >
                  WhatsApp
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POSScreen;
