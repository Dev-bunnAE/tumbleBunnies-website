'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of a cart item. This can be expanded later.
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Define the shape of the context value.
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

// Create the context with a default value.
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create the provider component.
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (itemToAdd: Omit<CartItem, 'quantity'>) => {
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

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const value = {
    items,
    addItem,
    removeItem,
    clearCart,
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
