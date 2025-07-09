'use client';

import { AdminHeader } from '@/components/admin/admin-header';
import { db, Order } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
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

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      await deleteDoc(doc(db, 'orders', id));
      setOrders(orders.filter(o => o.id !== id));
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
              placeholder="Parent, child, class, status..."
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
                    <td className="p-2">${order.totalAmount.toFixed(2)}</td>
                    <td className="p-2">{order.status}</td>
                    <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-destructive text-destructive-foreground px-2 py-1 rounded hover:bg-destructive/80"
                        onClick={() => handleDelete(order.id)}
                      >
                        Delete
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
  );
} 