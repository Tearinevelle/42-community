
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";

interface WalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WalletDialog({ open, onOpenChange }: WalletDialogProps) {
  const { isAuthenticated } = useAuth();

  const { data: wallet } = useQuery({
    queryKey: ['/api/wallet'],
    enabled: isAuthenticated,
  });

  const { data: transactions } = useQuery({
    queryKey: ['/api/wallet/transactions'],
    enabled: isAuthenticated,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Кошелёк</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance */}
          <div className="bg-card p-6 rounded-lg">
            <div className="text-sm text-muted-foreground">Баланс</div>
            <div className="text-3xl font-bold">{formatCurrency(wallet?.balance || 0)}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button className="flex-1" variant="outline">
              Вывести средства
            </Button>
            <Button className="flex-1">
              Способы вывода
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="pending">В ожидании</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
                <SelectItem value="cancelled">Отменено</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="deposit">Пополнение баланса</SelectItem>
                <SelectItem value="order_complete">Выполнение заказа</SelectItem>
                <SelectItem value="order_payment">Оплата заказа</SelectItem>
                <SelectItem value="withdrawal">Вывод средств</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Транзакции</h3>
            <div className="space-y-2">
              {transactions?.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">{transaction.date}</div>
                  </div>
                  <div className={transaction.type === 'deposit' ? 'text-green-500' : 'text-red-500'}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
