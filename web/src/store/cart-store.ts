import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string | null;
  basePrice: number;
  quantity: number;
  selectedOptions: { groupId: string; optionId: string; optionName: string; extraPrice: number }[];
  note?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const calculateTotalItems = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

const calculateSubtotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => {
    const optionsPrice = item.selectedOptions.reduce((optSum, opt) => optSum + opt.extraPrice, 0);
    return sum + (item.basePrice + optionsPrice) * item.quantity;
  }, 0);
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      
      addItem: (newItem) => set((state) => {
        const existingIndex = state.items.findIndex(item => 
          item.productId === newItem.productId &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(newItem.selectedOptions)
        );

        let updatedItems;
        if (existingIndex > -1) {
          updatedItems = [...state.items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + newItem.quantity,
          };
        } else {
          updatedItems = [...state.items, newItem];
        }

        return {
          items: updatedItems,
          totalItems: calculateTotalItems(updatedItems),
          subtotal: calculateSubtotal(updatedItems),
        };
      }),

      updateItem: (id, updates) => set((state) => {
        const updatedItems = state.items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
        return {
          items: updatedItems,
          totalItems: calculateTotalItems(updatedItems),
          subtotal: calculateSubtotal(updatedItems),
        };
      }),

      removeItem: (id) => set((state) => {
        const updatedItems = state.items.filter(item => item.id !== id);
        return {
          items: updatedItems,
          totalItems: calculateTotalItems(updatedItems),
          subtotal: calculateSubtotal(updatedItems),
        };
      }),

      clearCart: () => set({ 
        items: [],
        totalItems: 0,
        subtotal: 0,
      }),
    }),
    {
      name: 'fb-shop-cart',
      onRehydrateStorage: () => {
        return (state, error) => {
          if (state && !error) {
            state.totalItems = calculateTotalItems(state.items);
            state.subtotal = calculateSubtotal(state.items);
          }
        };
      },
    }
  )
);
