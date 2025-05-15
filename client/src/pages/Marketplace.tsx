import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import MarketplaceItem from "@/components/home/MarketplaceItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Marketplace() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [sortBy, setSortBy] = useState("newest");

  // Set page title
  useEffect(() => {
    document.title = "Сеть - Маркет | Универсальная социальная платформа";
  }, []);

  // Categories are now fetched from the API and can be created by users
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Listings are fetched from the API
  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: ['/api/listings'],
  });

  // Empty arrays as fallback
  const displayCategories = categories || [];
  const displayListings = listings || [];

  // Filter listings based on search and filters
  const filteredListings = displayListings.filter(listing => {
    // Search term filter
    const matchesSearch = searchTerm === "" || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory = category === "all" || (listing.categoryId && listing.categoryId.toString() === category);

    // Condition filter
    const matchesCondition = condition === "all" || listing.condition === condition;

    // Price range filter
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "views":
        return b.views - a.views;
      case "newest":
      default:
        // Assuming newer items have higher IDs
        return b.id - a.id;
    }
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Маркет</h1>
        <p className="text-gray-400">
          Покупайте и продавайте товары с гарантией безопасности через нашу платформу
        </p>
      </div>

      {/* Search and filters */}
      <div className="bg-card rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Input
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="md:w-auto w-full">
                <i className="fas fa-filter mr-2"></i>
                Фильтры
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card text-foreground">
              <DialogHeader>
                <DialogTitle>Фильтры</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <h3 className="text-sm font-medium mb-2">Категория</h3>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-muted">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      {displayCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Состояние</h3>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="bg-muted">
                      <SelectValue placeholder="Выберите состояние" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Любое</SelectItem>
                      <SelectItem value="new">Новое</SelectItem>
                      <SelectItem value="used">Б/У</SelectItem>
                      <SelectItem value="negotiable">Торг</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Цена</h3>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="От"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="bg-muted"
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      placeholder="До"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => {
                  setCategory("all");
                  setCondition("all");
                  setPriceRange([0, 1000000]);
                }}>
                  Сбросить
                </Button>
                <Button className="bg-secondary hover:bg-secondary/90">
                  Применить
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="md:w-[180px] w-full">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Сначала новые</SelectItem>
              <SelectItem value="price-asc">Сначала дешевле</SelectItem>
              <SelectItem value="price-desc">Сначала дороже</SelectItem>
              <SelectItem value="views">По популярности</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Tabs defaultValue="all" className="w-full" onValueChange={(val) => setCategory(val)}>
            <TabsList className="w-full h-auto flex flex-wrap bg-transparent overflow-x-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-secondary data-[state=active]:text-white">
                Все категории
              </TabsTrigger>
              {displayCategories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id.toString()}
                  className="data-[state=active]:bg-secondary data-[state=active]:text-white"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Add new listing button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {filteredListings.length} {filteredListings.length === 1 ? 'товар' : 
           filteredListings.length > 1 && filteredListings.length < 5 ? 'товара' : 'товаров'}
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90">
              <i className="fas fa-plus mr-2"></i>
              Разместить товар
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card text-foreground">
            <DialogHeader>
              <DialogTitle>Разместить новый товар</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-gray-400">
                Чтобы разместить товар, пожалуйста, войдите через Telegram
              </p>
              {/* Telegram login button would go here for non-authenticated users */}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Listings grid */}
      {sortedListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedListings.map((listing) => (
            <MarketplaceItem key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <i className="fas fa-search text-6xl text-gray-500 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">Товары не найдены</h3>
          <p className="text-gray-400 mb-4">
            Попробуйте изменить параметры поиска или фильтры
          </p>
          <Button 
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setCategory("all");
              setCondition("all");
              setPriceRange([0, 1000000]);
            }}
          >
            Сбросить фильтры
          </Button>
        </div>
      )}
    </>
  );
}