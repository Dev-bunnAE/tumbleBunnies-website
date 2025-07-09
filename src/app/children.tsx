import Link from 'next/link';

export default function Children() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-xl">
      <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Add Children</h1>
      <form className="bg-card rounded-lg shadow-md p-6 space-y-4">
        <input className="w-full p-2 border rounded" placeholder="Child's Name" disabled />
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold w-full" disabled>
          Add Child
        </button>
      </form>
      <div className="text-center mt-4">
        <Link href="/classes" className="text-primary hover:underline">Continue to Class Selection</Link>
      </div>
    </main>
  );
} 