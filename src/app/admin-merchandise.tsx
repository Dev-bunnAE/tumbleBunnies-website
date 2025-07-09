'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react';

interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  enabled: boolean;
}

function getMerchandise(): MerchandiseItem[] {
  const merchString = localStorage.getItem('tumblebunnies-merchandise');
  if (merchString) {
    try {
      return JSON.parse(merchString);
    } catch {
      return [];
    }
  }
  return [];
}

function saveMerchandise(items: MerchandiseItem[]) {
  localStorage.setItem('tumblebunnies-merchandise', JSON.stringify(items));
}

export default function AdminMerchandisePage() {
  const [items, setItems] = useState<MerchandiseItem[]>([]);
  const [editing, setEditing] = useState<MerchandiseItem | null>(null);
  const [form, setForm] = useState<Omit<MerchandiseItem, 'id'>>({
    name: '',
    description: '',
    price: 0,
    image: null,
    enabled: true,
  });

  useEffect(() => {
    setItems(getMerchandise());
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, image: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || form.price <= 0) return;
    let updated: MerchandiseItem[];
    if (editing) {
      updated = items.map((item) =>
        item.id === editing.id ? { ...editing, ...form } : item
      );
    } else {
      updated = [
        ...items,
        { ...form, id: Date.now().toString() },
      ];
    }
    setItems(updated);
    saveMerchandise(updated);
    setEditing(null);
    setForm({ name: '', description: '', price: 0, image: null, enabled: true });
  }

  function handleEdit(item: MerchandiseItem) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      enabled: item.enabled,
    });
  }

  function handleDelete(id: string) {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    saveMerchandise(updated);
  }

  function handleToggle(id: string) {
    const updated = items.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    setItems(updated);
    saveMerchandise(updated);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">Admin: Manage Merchandise</h1>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-12 p-6 bg-card rounded-lg shadow-md space-y-4">
        <h2 className="font-bold text-xl mb-2">{editing ? 'Edit Merchandise' : 'Add Merchandise'}</h2>
        <Input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
        <Input
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleInputChange}
          min={0}
          step={0.01}
          required
        />
        <Input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {form.image && (
          <img src={form.image} alt="Preview" className="w-32 h-32 object-cover rounded" />
        )}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={() => setForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
            id="enabled"
          />
          <label htmlFor="enabled">Enabled</label>
        </div>
        <Button type="submit">{editing ? 'Update' : 'Add'} Merchandise</Button>
        {editing && (
          <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm({ name: '', description: '', price: 0, image: null, enabled: true }); }}>Cancel</Button>
        )}
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {items.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">No merchandise yet.</div>
        ) : (
          items.map((item) => (
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
                <CardTitle className="font-headline text-xl flex justify-between items-center">
                  {item.name}
                  <Button type="button" size="sm" variant="outline" onClick={() => handleToggle(item.id)}>
                    {item.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="mb-2 text-muted-foreground">{item.description}</p>
                <span className="text-lg font-bold text-primary mb-2">${item.price.toFixed(2)}</span>
                <div className="flex gap-2 mt-auto">
                  <Button type="button" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 