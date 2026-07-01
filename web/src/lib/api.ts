import { API_URL } from "./utils";
import type { Category, Product, ProductsResponse } from "@/types";

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${path}`);
    }

    return res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await fetchApi<Category[]>("/categories");
  } catch {
    return [];
  }
}

export async function getProducts(params?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.featured) searchParams.set("featured", "true");
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);

  const query = searchParams.toString();
  try {
    return await fetchApi<ProductsResponse>(
      `/products${query ? `?${query}` : ""}`,
    );
  } catch {
    return { items: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
  }
}

export async function getBestsellers(): Promise<Product[]> {
  try {
    return await fetchApi<Product[]>("/products/bestsellers?limit=8");
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await fetchApi<Product>(`/products/slug/${slug}`);
  } catch {
    return null;
  }
}
