import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, User, Order } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Star, 
  ShoppingCart, 
  MapPin, 
  Shield, 
  Truck, 
  CreditCard,
  ThumbsUp
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

const ProductPage = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  // Fetch product details
  const { data: product, isLoading } = useQuery<Product & { user: User }>({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      return res.json();
    },
    enabled: !!id,
  });
  
  // Purchase product mutation
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/orders', {
        productId: Number(id),
        sellerId: product?.userId,
        amount: product?.price
      });
    },
    onSuccess: (data: Order) => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsConfirmDialogOpen(false);
      toast({
        title: "Заказ создан",
        description: "Ваш заказ успешно оформлен и ожидает оплаты",
      });
      navigate(`/orders/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось оформить заказ. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  const handlePurchase = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    if (product?.userId === user?.id) {
      toast({
        title: "Ошибка",
        description: "Вы не можете купить свой собственный товар",
        variant: "destructive",
      });
      return;
    }
    
    setIsConfirmDialogOpen(true);
  };
  
  const confirmPurchase = () => {
    purchaseMutation.mutate();
  };
  
  // Format price to local currency
  const formatPrice = (price: number | string | undefined) => {
    if (!price) return "";
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(Number(price));
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Товар, который вы ищете, не существует или был удален.
        </p>
        <Button onClick={() => navigate("/marketplace")}>Вернуться к товарам</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img 
            src={product.imageUrl}
            alt={product.title} 
            className="w-full h-auto object-cover rounded-lg shadow-md"
          />
        </div>
        
        {/* Product Details */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold font-heading">{product.title}</h1>
          
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(product.price)}
            </div>
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>{product.rating ? Number(product.rating).toFixed(1) : "Новый"}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                ({product.ratingCount || 0} {product.ratingCount === 1 ? "отзыв" : "отзывов"})
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>Москва</span>
              <span className="mx-1">•</span>
              <span>
                {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true, locale: ru })}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Описание</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center mt-4 gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={product.user.profileImageUrl || ""} alt={product.user.username || ""} />
                <AvatarFallback>{(product.user.username || product.user.firstName || "?").slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {product.user.username || `${product.user.firstName || ''} ${product.user.lastName || ''}`}
                </div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary-600 dark:text-primary-400"
                  onClick={() => navigate(`/profile/${product.user.id}`)}
                >
                  Профиль продавца
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {product.category}
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Shield className="h-5 w-5 text-green-500 mb-1" />
              <span className="text-xs text-gray-700 dark:text-gray-300">Безопасная сделка</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Truck className="h-5 w-5 text-blue-500 mb-1" />
              <span className="text-xs text-gray-700 dark:text-gray-300">Доставка</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-500 mb-1" />
              <span className="text-xs text-gray-700 dark:text-gray-300">Оплата онлайн</span>
            </div>
          </div>
          
          <Button 
            className="w-full gap-2 mt-6"
            onClick={handlePurchase}
            disabled={purchaseMutation.isPending}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Купить</span>
          </Button>
        </div>
      </div>
      
      {/* Product details tabs */}
      <div className="mt-10">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
            <TabsTrigger value="delivery">Доставка и оплата</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="p-4">
            <div className="prose dark:prose-invert max-w-none">
              <h3>Описание товара</h3>
              <p>{product.description}</p>
              
              <h4>Характеристики</h4>
              <ul>
                <li>Категория: {product.category}</li>
                <li>Состояние: Новый</li>
                <li>Продавец: {product.user.username || `${product.user.firstName || ''} ${product.user.lastName || ''}`}</li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="p-4">
            {product.ratingCount && product.ratingCount > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">{Number(product.rating).toFixed(1)}</div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      {Array(5).fill(0).map((_, i) => (
                        <Star 
                          key={i}
                          className={`h-5 w-5 ${i < Math.round(Number(product.rating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Всего {product.ratingCount} {product.ratingCount === 1 ? "отзыв" : 
                        product.ratingCount < 5 ? "отзыва" : "отзывов"}
                    </div>
                  </div>
                </div>
                
                {/* Sample reviews (would be fetched from API in a real implementation) */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>А</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Анна</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">2 недели назад</div>
                        </div>
                        <div className="ml-auto flex items-center">
                          {Array(5).fill(0).map((_, i) => (
                            <Star 
                              key={i}
                              className={`h-4 w-4 ${i < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p>Отличный товар! Очень довольна покупкой, все работает идеально. Доставка была быстрой.</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>М</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Максим</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">1 месяц назад</div>
                        </div>
                        <div className="ml-auto flex items-center">
                          {Array(5).fill(0).map((_, i) => (
                            <Star 
                              key={i}
                              className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p>Хорошее качество, но есть небольшие недочеты. В целом рекомендую.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ThumbsUp className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет отзывов</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Этот товар пока не имеет отзывов. Будьте первым, кто оставит отзыв!
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="delivery" className="p-4">
            <div className="prose dark:prose-invert max-w-none">
              <h3>Доставка</h3>
              <p>Доставка осуществляется по всей России. Сроки доставки зависят от вашего региона.</p>
              <ul>
                <li>Москва и Санкт-Петербург: 1-2 дня</li>
                <li>Другие города: 3-7 дней</li>
              </ul>
              
              <h3>Оплата</h3>
              <p>Доступные способы оплаты:</p>
              <ul>
                <li>Банковская карта</li>
                <li>Электронные кошельки</li>
                <li>Безопасная сделка через эскроу</li>
              </ul>
              
              <h3>Гарантии и возврат</h3>
              <p>Гарантия на товар составляет 12 месяцев. Возврат возможен в течение 14 дней с момента получения.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Purchase confirmation dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение покупки</DialogTitle>
            <DialogDescription>
              Вы собираетесь приобрести товар "{product.title}" за {formatPrice(product.price)}.
              Средства будут заморожены в системе эскроу до подтверждения получения товара.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Товар:</span>
              <span className="font-medium">{product.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Стоимость:</span>
              <span className="font-medium">{formatPrice(product.price)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Продавец:</span>
              <span className="font-medium">
                {product.user.username || `${product.user.firstName || ''} ${product.user.lastName || ''}`}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={confirmPurchase} disabled={purchaseMutation.isPending}>
              {purchaseMutation.isPending ? "Обработка..." : "Подтвердить покупку"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductPage;
