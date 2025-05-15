import { Star } from "lucide-react";
import { Link } from "wouter";
import { Product, User } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product & { user: User };
  compact?: boolean;
}

const ProductCard = ({ product, compact = false }: ProductCardProps) => {
  // Format price to local currency
  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(Number(product.price));

  return (
    <Link href={`/product/${product.id}`}>
      <a className="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-750 group cursor-pointer block">
        <div className="relative aspect-square">
          <img 
            src={product.imageUrl}
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-sm text-accent-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <i className="ri-heart-line"></i>
          </div>
        </div>
        <div className={cn("p-2", compact ? "" : "p-3")}>
          <h4 className="font-medium text-sm truncate">{product.title}</h4>
          <div className="flex justify-between items-center mt-1">
            <span className="font-semibold text-primary-600 dark:text-primary-400">{formattedPrice}</span>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              {product.rating ? Number(product.rating).toFixed(1) : "Новый"}
            </div>
          </div>
          {!compact && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2">
              {product.description}
            </p>
          )}
        </div>
      </a>
    </Link>
  );
};

export default ProductCard;
