import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  Warehouse as WarehouseIcon,
  ArrowLeft,
  MapPin,
  User,
  Mail,
  Phone,
  Boxes,
  DollarSign,
  History,
  ArrowRightLeft,
} from 'lucide-react';
import warehouseService from '../../../services/warehouseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import StockStatusBadge from '../../../components/inventory/StockStatusBadge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const WarehouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarehouse();
  }, [id]);

  const fetchWarehouse = async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getWarehouse(id);
      setWarehouse(res.data);
    } catch (err) {
      console.error('Error fetching warehouse:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!warehouse) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-3">
        <p>Warehouse not found.</p>
        <Button variant="secondary" onClick={() => navigate('/app/inventory/warehouses')}>
          Back to Warehouses
        </Button>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/app/inventory/warehouses')}
        >
          Back
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <WarehouseIcon className="w-6 h-6 text-teal-600" />
              {warehouse.name}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
              {warehouse.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Code: <span className="font-mono font-bold text-slate-700">{warehouse.code}</span> | Type:{' '}
            <span className="capitalize font-semibold text-slate-700">{warehouse.type}</span> | Manager:{' '}
            <span className="font-semibold text-slate-700">{warehouse.manager_name || 'Unassigned'}</span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Unique SKUs</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{warehouse.total_products}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Catalog coverage</span>
        </Card>
        <Card className="p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Stock Units</span>
          <div className="text-2xl font-extrabold text-teal-600 mt-1">
            {Number(warehouse.total_quantity || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Units stored here</span>
        </Card>
        <Card className="p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Stock Value</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {formatCurrency(warehouse.total_stock_value)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Estimated inventory worth</span>
        </Card>
        <Card className="p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Depot Facility</span>
          <div className="text-sm font-bold text-slate-800 mt-2 truncate">
            {warehouse.city ? `${warehouse.city}, ${warehouse.state}` : 'Main Campus'}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{warehouse.address || 'Standard facility'}</span>
        </Card>
      </div>

      {/* Warehouse Stock Inventory List */}
      <Card className="p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
          <Boxes className="w-4 h-4 text-teal-600" />
          Depot Inventory Stocks
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Product Name</th>
                <th className="p-2.5">SKU</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5 text-right">Available</th>
                <th className="p-2.5 text-right">Reserved</th>
                <th className="p-2.5 text-right">Damaged</th>
                <th className="p-2.5 text-right">Total Units</th>
                <th className="p-2.5">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!warehouse.stocks || warehouse.stocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-400">
                    No active stock records found in this warehouse.
                  </td>
                </tr>
              ) : (
                warehouse.stocks.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-semibold text-slate-900">
                      <NavLink
                        to={`/app/inventory/products/${s.product_id}`}
                        className="hover:text-teal-600 hover:underline"
                      >
                        {s.product?.name || 'Product'}
                      </NavLink>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-700">{s.product?.sku}</td>
                    <td className="p-2.5 text-slate-600">{s.product?.category?.name || '—'}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-600">
                      {s.available_quantity}
                    </td>
                    <td className="p-2.5 text-right text-slate-500">{s.reserved_quantity || 0}</td>
                    <td className="p-2.5 text-right text-slate-400">{s.damaged_quantity || 0}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{s.quantity}</td>
                    <td className="p-2.5">
                      <StockStatusBadge status={s.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default WarehouseDetail;
