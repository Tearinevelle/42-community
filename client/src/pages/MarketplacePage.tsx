import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, User } from "@shared/schema";
import ProductCard from "@/components/marketplace/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const MarketplacePage = () => {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const pageSize = 12;

  // Fetch products with pagination and filtering
  const { data: products = [], isLoading, isFetching } = useQuery<(Product & { user: User })[]>({
    queryKey: ['/api/products', { limit: pageSize, offset: page * pageSize, category, search: searchQuery }],
    queryFn: async () => {
      let url = `/api/products?limit=${pageSize}&offset=${page * pageSize}`;
      if (category && category !== "all") {
        url += `&category=${category}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    keepPreviousData: true,
  });

  // Categories for filtering (these would ideally come from the backend)
  const categories = [
    { id: "all", name: "Все категории" },
    { id: "electronics", name: "Электроника" },
    { id: "clothing", name: "Одежда" },
    { id: "home", name: "Дом и сад" },
    { id: "sports", name: "Спорт" },
    { id: "toys", name: "Игрушки" },
    { id: "books", name: "Книги" },
  ];

  const loadMoreProducts = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Reset to first page when searching
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(0); // Reset to first page when changing category
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold font-heading mb-6">Маркетплейс</h1>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button */}
          {products.length >= pageSize && (
            <div className="mt-8 text-center">
              <Button 
                onClick={loadMoreProducts}
                disabled={isFetching}
                variant="outline"
                className="px-6"
              >
                {isFetching ? "Загрузка..." : "Показать ещё товары"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-2">Товары не найдены</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || category !== "all" 
              ? "Попробуйте изменить параметры поиска" 
              : "В данный момент товары отсутствуют"}
          </p>
          {(searchQuery || category !== "all") && (
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setCategory("all");
              }}
            >
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}
      <div className="space-y-4 py-2">
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Название товара</label>
                  <Input id="title" placeholder="Введите название товара" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Описание</label>
                  <Textarea id="description" placeholder="Опишите ваш товар" className="min-h-[100px]" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">Цена</label>
                  <Input id="price" type="number" placeholder="Введите цену" />
                </div>
                <Button className="w-full bg-secondary hover:bg-secondary/90">
                  Разместить товар
                </Button>
              </form>
            </div>
    </div>
  );
};

export default MarketplacePage;