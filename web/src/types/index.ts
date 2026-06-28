export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
  _count?: { products: number };
}

export interface ProductOption {
  id: string;
  name: string;
  extraPrice: string | number;
  isAvailable: boolean;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ProductOption[];
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
  optionGroups?: ProductOptionGroup[];
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
