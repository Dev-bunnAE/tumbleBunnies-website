'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

// Define the shape of a cart item. This can be expanded later.
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  childName?: string; // Optional child name for class registrations
  classId?: string; // Optional class ID for tracking
  sessionLength?: number; // Optional session length for tracking
}

// Define the shape of the context value.
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  decreaseItem: (itemId: string) => void;
  clearCart: () => void;
  updateItemChild: (itemId: string, childName: string) => void;
}

// Create the context with a default value.
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the provider component.
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (itemToAdd: Omit<CartItem, 'quantity'> | CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemToAdd.id);
      if (existingItem) {
        // If item already exists, increase quantity
        return prevItems.map((item) =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Otherwise, add new item with quantity 1
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
  };

  const decreaseItem = (itemId: string) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        // Decrease quantity
        return prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      // If quantity is 1, remove the item
      return prevItems.filter((item) => item.id !== itemId);
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const updateItemChild = (itemId: string, childName: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, childName } : item
      )
    );
  };

  const value = {
    items,
    addItem,
    removeItem,
    decreaseItem,
    clearCart,
    updateItemChild,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Create a custom hook to use the cart context.
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
