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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => set((state) => {
        const existingIndex = state.items.findIndex(item => 
          item.productId === newItem.productId &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(newItem.selectedOptions)
        );

        if (existingIndex > -1) {
          const updatedItems = [...state.items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + newItem.quantity,
          };
          return { items: updatedItems };
        }

        return { items: [...state.items, newItem] };
      }),

      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(item => item.id === id ? { ...item, ...updates } : item),
      })),

      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id),
      })),

      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce((sum, item) => {
          const optionsPrice = item.selectedOptions.reduce((optSum, opt) => optSum + opt.extraPrice, 0);
          return sum + (item.basePrice + optionsPrice) * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'fb-shop-cart',
    }
  )
);
