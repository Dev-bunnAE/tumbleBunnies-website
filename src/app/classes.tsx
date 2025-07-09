import Link from 'next/link';

export default function Classes() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Class & Session Selection</h1>
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <div className="text-muted-foreground text-center">(Class and session options will appear here based on facility code and children added.)</div>
      </div>
      <div className="flex justify-end">
        <Link href="/cart" className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition">Go to Cart</Link>
      </div>
    </main>
  );
} 