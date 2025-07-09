'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { useEffect, useState } from 'react';

interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  enabled: boolean;
}

export default function MerchandisePage() {
  const [items, setItems] = useState<MerchandiseItem[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    // Load merchandise from localStorage (admin should save here)
    const merchString = localStorage.getItem('tumblebunnies-merchandise');
    if (merchString) {
      try {
        const parsed: MerchandiseItem[] = JSON.parse(merchString);
        setItems(parsed.filter((item) => item.enabled && item.price > 0));
      } catch (e) {
        setItems([]);
      }
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">TumbleBunnies Merchandise</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {items.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">No merchandise available at this time.</div>
        ) : (
          items.map((item: MerchandiseItem) => (
            <Card key={item.id} className="flex flex-col">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  style={{ objectFit: 'cover' }}
                />
              )}
              <CardHeader>
                <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="mb-4 text-muted-foreground">{item.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</span>
                  <Button onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}>
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 