import MarketplaceItem from "./MarketplaceItem";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function MarketplaceSection() {
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['/api/listings/popular'],
  });

  // Use actual data from API
  const displayListings = listings || [];

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-montserrat">Популярные товары</h2>
        <Link href="/marketplace">
          <a className="text-secondary flex items-center gap-1 hover:underline">
            <span>Все товары</span>
            <i className="fas fa-chevron-right text-sm"></i>
          </a>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayListings.map((listing) => (
          <MarketplaceItem key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
