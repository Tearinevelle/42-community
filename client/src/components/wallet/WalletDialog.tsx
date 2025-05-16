
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface WalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WalletDialog({ open, onOpenChange }: WalletDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("balance");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Fetch wallet data
  const { data: wallet } = useQuery({
    queryKey: ['/api/wallet'],
    queryFn: () => apiRequest('GET', '/api/wallet'),
  });

  // Fetch transactions
  const { data: transactions } = useQuery({
    queryKey: ['/api/wallet/transactions', selectedStatus, selectedType],
    queryFn: () => apiRequest('GET', `/api/wallet/transactions?status=${selectedStatus}&type=${selectedType}`),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Кошелёк</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* Баланс */}
          <div className="bg-card p-4 rounded-lg">
            <div className="text-sm text-gray-400">Баланс:</div>
            <div className="text-2xl font-bold">{wallet?.balance || 0} ₽</div>
          </div>

          {/* Действия */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => setActiveTab("withdraw")}>
              <i className="fas fa-wallet mr-2"></i>
              Вывести средства
            </Button>
            <Button variant="outline" onClick={() => setActiveTab("methods")}>
              <i className="fas fa-credit-card mr-2"></i>
              Способы вывода
            </Button>
          </div>

          {/* Фильтры */}
          <div className="flex gap-4">
            <select 
              className="bg-input p-2 rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="pending">В ожидании</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Отменено</option>
            </select>

            <select
              className="bg-input p-2 rounded-md"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Все типы</option>
              <option value="deposit">Пополнение баланса</option>
              <option value="order_completion">Выполнение заказа</option>
              <option value="order_payment">Оплата заказа</option>
              <option value="withdrawal">Вывод средств</option>
            </select>
          </div>

          {/* Транзакции */}
          <div className="space-y-2">
            <h3 className="font-semibold">Транзакции</h3>
            <div className="space-y-2">
              {transactions?.map((transaction) => (
                <div key={transaction.id} className="bg-card p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} ₽
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
