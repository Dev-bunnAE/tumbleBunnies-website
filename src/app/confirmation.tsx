import Link from 'next/link';

export default function Confirmation() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-xl text-center">
      <h1 className="text-3xl font-headline font-bold text-primary mb-8">Order Confirmed!</h1>
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <div className="text-muted-foreground">Thank you for your registration and payment. A confirmation email will be sent to you shortly.</div>
      </div>
      <Link href="/" className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary/90 transition">Return Home</Link>
    </main>
  );
} 