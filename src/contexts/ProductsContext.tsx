import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  features: string[];
}

interface ProductsContextType {
  products: Product[];
  addProduct: (productData: FormData) => Promise<void>;
  updateProduct: (id: string, productData: FormData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | undefined>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const response: any = await apiService.getProducts();
      const mappedProducts: Product[] = (response.products || []).map((p: any) => ({
        id: p.id?.toString() ?? '',
        name: p.name ?? '',
        description: p.description ?? '',
        price: p.price ?? 0,
        image: p.image ?? '',
        category: p.category ?? '',
        rating: p.rating ?? 0,
        reviewsCount: p.reviews_count ?? 0,
        stock: p.stock ?? 0,
        features: typeof p.features === 'string' ? p.features.split(',') : [],
      }));
      setProducts(mappedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchProductById = async (id: string): Promise<Product | undefined> => {
    try {
      const response: any = await apiService.getProduct(id);
      const p: any = response.product;
      return {
        id: p.id?.toString() ?? '',
        name: p.name ?? '',
        description: p.description ?? '',
        price: p.price ?? 0,
        image: p.image ?? '',
        category: p.category ?? '',
        rating: p.rating ?? 0,
        reviewsCount: p.reviews_count ?? 0,
        stock: p.stock ?? 0,
        features: typeof p.features === 'string' ? p.features.split(',') : [],
      };
    } catch (error: any) {
      console.error(`Error fetching product ${id}:`, error);
      return undefined;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (productData: FormData) => {
    try {
      await apiService.createProduct(productData);
      await fetchProducts();
    } catch (error: any) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: FormData) => {
    try {
      await apiService.updateProduct(id, productData);
      await fetchProducts();
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiService.deleteProduct(id);
      await fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const value: ProductsContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
    fetchProductById,
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};