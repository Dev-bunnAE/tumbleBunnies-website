'use client';

import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { AdminHeader } from '@/components/admin/admin-header';
import { db, Order } from '@/lib/firebase';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function isWithinLastNDays(date: number, days: number) {
  const now = new Date();
  const d = new Date(date);
  const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('30'); // days
  const router = useRouter();

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'orders'));
      const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Order[];
      setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  async function handleRefund(id: string) {
    if (confirm('Are you sure you want to process a refund for this order?')) {
      // TODO: Integrate with payment processor for actual refund
      // For now, just update the status in Firestore
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, { status: 'refunded' });
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'refunded' } : o));
    }
  }

  // Filtering logic
  const filteredOrders = orders.filter(order => {
    // Date filter
    if (dateFilter !== 'all' && !isWithinLastNDays(order.createdAt, Number(dateFilter))) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    // Search filter
    const searchLower = search.toLowerCase();
    if (searchLower) {
      if (
        !order.parentName.toLowerCase().includes(searchLower) &&
        !order.parentEmail.toLowerCase().includes(searchLower) &&
        !order.items.some(item =>
          (item.childName && item.childName.toLowerCase().includes(searchLower)) ||
          (item.classId && item.classId.toLowerCase().includes(searchLower))
        ) &&
        !order.status.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <AdminAuthGuard>
      <div>
        <AdminHeader />
        <main className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-headline font-bold text-primary">Manage Orders</h1>
            <Link href="/admin/orders/new" className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition">Add Order</Link>
          </div>
          <div className="mb-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold mb-1">Search</label>
              <input
                className="p-2 border rounded w-48"
                placeholder="Parent, email, child, class, status..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select
                className="p-2 border rounded"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Date</label>
              <select
                className="p-2 border rounded"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="1">Last 1 day</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </div>
          </div>
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="font-bold text-xl mb-4">Orders List</h2>
            {loading ? (
              <p>Loading...</p>
            ) : filteredOrders.length === 0 ? (
              <p className="text-muted-foreground mb-4">No orders found.</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Parent</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Items</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="border-t">
                      <td className="p-2">{order.parentName}</td>
                      <td className="p-2">{order.parentEmail}</td>
                      <td className="p-2">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="p-2">${order.totalAmount.toFixed(2)}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          className="bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
                          onClick={() => handleRefund(order.id)}
                          disabled={order.status === 'refunded'}
                        >
                          Refund
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </AdminAuthGuard>
  );
} 