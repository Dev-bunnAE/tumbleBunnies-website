import Link from 'next/link';

export default function Cart() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Shopping Cart</h1>
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <div className="text-muted-foreground text-center">(Selected classes and sessions will appear here.)</div>
      </div>
      <div className="flex justify-end">
        <Link href="/checkout" className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition">Proceed to Checkout</Link>
      </div>
    </main>
  );
} 