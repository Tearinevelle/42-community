import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, User } from "@shared/schema";
import ProductCard from "./ProductCard";

const MarketplacePreview = () => {
  const { data: products = [], isLoading } = useQuery<(Product & { user: User })[]>({
    queryKey: ['/api/products', { limit: 4 }],
    queryFn: async () => {
      const res = await fetch('/api/products?limit=4');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading font-semibold">Маркетплейс</h3>
        <Link href="/marketplace">
          <a className="text-primary-600 dark:text-primary-400 text-sm">
            Все товары <i className="ri-arrow-right-s-line"></i>
          </a>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {isLoading ? (
          // Skeleton loaders
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-750">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="p-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))
        ) : products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product.id} product={product} compact />
          ))
        ) : (
          <div className="col-span-2 text-center py-6 text-gray-500 dark:text-gray-400">
            Нет доступных товаров
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePreview;
