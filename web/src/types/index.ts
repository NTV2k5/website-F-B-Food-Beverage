export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  basePrice: string | number;
  image?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  isFeatured?: boolean;
  isAvailable?: boolean;
}

export interface ProductsResponse {
  items: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string | null;
}
