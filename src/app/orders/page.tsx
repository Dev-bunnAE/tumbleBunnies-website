"use client";

import { StorefrontHeader } from "@/components/storefront-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order, db, useAuth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Calendar, DollarSign, ShoppingCart, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserOrders() {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("parentEmail", "==", user.email));
        const querySnapshot = await getDocs(q);
        
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        
        // Sort by creation date (newest first)
        ordersData.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserOrders();
  }, [user]);

  if (!user) {
    return (
      <>
        <StorefrontHeader />
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-headline font-bold text-primary mb-4">My Orders</h1>
            <p className="text-muted-foreground mb-8">Please log in to view your orders.</p>
            <Button onClick={() => router.push("/login")}>
              Log In
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <StorefrontHeader />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">My Orders</h1>
          <p className="text-muted-foreground">View your class registrations and order history</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Browse our classes and register your children!
              </p>
              <Button onClick={() => router.push("/")}>
                Browse Classes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Order #{order.id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${order.totalAmount.toFixed(2)}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'paid' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-primary">
                            {item.classId} {/* We'll need to fetch class names */}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <User className="w-3 h-3" />
                            <span>For {item.childName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {item.sessionLength} sessions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${item.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
} 