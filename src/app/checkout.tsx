import Link from 'next/link';

export default function Checkout() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-xl">
      <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Checkout</h1>
      <form className="bg-card rounded-lg shadow-md p-6 space-y-4">
        <input className="w-full p-2 border rounded" placeholder="Card Number" disabled />
        <input className="w-full p-2 border rounded" placeholder="Expiration Date" disabled />
        <input className="w-full p-2 border rounded" placeholder="CVC" disabled />
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold w-full" disabled>
          Complete Order
        </button>
      </form>
      <div className="text-center mt-4">
        <Link href="/cart" className="text-primary hover:underline">Back to Cart</Link>
      </div>
    </main>
  );
} 