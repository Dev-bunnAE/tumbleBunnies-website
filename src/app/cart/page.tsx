'use client';

import { StorefrontHeader } from '@/components/storefront-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { MinusCircle, PlusCircle, ShoppingCart, Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, addItem, decreaseItem, clearCart } = useCart();
  const router = useRouter();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <StorefrontHeader />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">Review your items before checkout</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Your Items ({items.reduce((sum, item) => sum + item.quantity, 0)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">Your cart is empty.</h3>
                <p className="mb-6">Looks like you haven't added any classes yet!</p>
                <Button onClick={() => router.push('/')}>Browse Classes</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="flex-1">
                      <div className="font-semibold text-primary">{item.name}</div>
                      {item.childName && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <User className="w-3 h-3" />
                          <span>For {item.childName}</span>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                         <Button size="icon" variant="ghost" onClick={() => decreaseItem(item.id)}><MinusCircle className="w-4 h-4" /></Button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                         <Button size="icon" variant="ghost" onClick={() => addItem(item)}><PlusCircle className="w-4 h-4" /></Button>
                      </div>
                       <div className="text-right font-semibold w-20">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center font-bold text-lg pt-4 border-t">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between mt-6">
                   <Button variant="outline" onClick={clearCart}>
                    Clear Cart
                  </Button>
                  <Button onClick={() => router.push('/checkout')} disabled={items.length === 0}>
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
