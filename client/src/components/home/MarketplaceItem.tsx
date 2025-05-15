import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatPrice } from "@/lib/utils";

interface MarketplaceItemProps {
  listing: {
    id: number;
    title: string;
    description: string;
    price: number;
    condition: string;
    views: number;
    images: string[];
    seller: {
      id: number;
      displayName: string;
      avatar: string | null;
      rating: number;
    };
  };
}

export default function MarketplaceItem({ listing }: MarketplaceItemProps) {
  const conditionLabel = 
    listing.condition === "new" ? "Новый" :
    listing.condition === "used" ? "Б/У" : "Торг";
  
  const conditionClassMap = {
    "new": "bg-secondary/20 text-secondary",
    "used": "bg-blue-500/20 text-blue-400",
    "negotiable": "bg-green-500/20 text-green-400"
  };
  
  const conditionClass = conditionClassMap[listing.condition as keyof typeof conditionClassMap] || conditionClassMap.new;
  
  // Use the first image or a placeholder
  const imageUrl = listing.images && listing.images.length > 0
    ? listing.images[0]
    : "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250";
  
  return (
    <div className="gradient-border">
      <div className="bg-muted rounded-lg overflow-hidden">
        <img 
          src={imageUrl} 
          alt={listing.title} 
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">{listing.title}</h3>
            <span className={`${conditionClass} text-xs px-2 py-1 rounded-full`}>
              {conditionLabel}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">{listing.description}</p>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xl font-bold">{formatPrice(listing.price)}</span>
            <div className="flex items-center text-xs text-gray-400">
              <i className="fas fa-eye mr-1"></i>
              <span>{listing.views}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <img 
              src={listing.seller.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40"} 
              alt={listing.seller.displayName} 
              className="w-5 h-5 rounded-full mr-2"
            />
            <span className="text-gray-400">{listing.seller.displayName}</span>
            <span className="ml-auto flex items-center text-yellow-500">
              <i className="fas fa-star mr-1"></i>
              <span>{listing.seller.rating.toFixed(1)}</span>
            </span>
          </div>
          <Link href={`/marketplace/${listing.id}`}>
            <Button className="w-full mt-3 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors">
              Подробнее
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
