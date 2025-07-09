"use client";

import { StorefrontHeader } from "@/components/storefront-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/lib/firebase";
import { CreditCard, ShoppingCart, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const { items, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    
    try {
      console.log('Starting checkout process...');
      console.log('User:', user?.email);
      console.log('Items:', items);
      console.log('Total:', total);
      
      // Prepare order data
      const orderData = {
        parentName: name,
        parentEmail: user?.email || '',
        totalAmount: total,
        items: items.map(item => ({
          classId: item.classId || '',
          childName: item.childName || '',
          sessionLength: item.sessionLength || 0,
          price: item.price
        }))
      };

      console.log('Order data to save:', orderData);
      
      // Save order via API route
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      console.log('Order saved successfully with ID:', result.orderId);

      // Simulate payment processing
      setTimeout(() => {
        setProcessing(false);
        setSuccess(true);
        clearCart();
        setTimeout(() => router.push("/orders"), 2000);
      }, 1500);
    } catch (error: any) {
      console.error('Error saving order:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setProcessing(false);
      // Show error to user
      alert(`Error saving order: ${error.message}`);
    }
  }

  if (success) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-lg text-center">
        <StorefrontHeader />
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Thank you!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">Your order has been placed successfully. You'll receive a confirmation email soon.</p>
            <p className="text-sm text-muted-foreground">Redirecting to your orders...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <>
      <StorefrontHeader />
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">Checkout</h1>
          <p className="text-muted-foreground">Review your cart and complete your purchase</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-semibold text-primary">{item.name}</div>
                        {item.childName && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <User className="w-3 h-3" />
                            <span>For {item.childName}</span>
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground mt-1">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-lg pt-4 border-t">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Add items to your cart to proceed with checkout.</p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleCheckout}>
                  <div>
                    <label className="block font-medium mb-2">Name on Card</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Card Number</label>
                    <input
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={card}
                      onChange={e => setCard(e.target.value)}
                      required
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
                    disabled={processing}
                  >
                    {processing ? "Processing..." : `Place Order - $${total.toFixed(2)}`}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
} 