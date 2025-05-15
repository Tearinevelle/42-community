
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { RefreshCw, User, Shield, Award, AlertCircle, Volume2, VolumeX, UserPlus, Ban } from "lucide-react";

type UserRank = {
  userId: number;
  rankId: number;
  isActive: boolean;
  assignedBy: number;
  assignedAt: string;
  rank: {
    id: number;
    name: string;
    description: string | null;
    isSystem: boolean;
    level: number | null;
  }
};

export default function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  
  // Dialogs state
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);
  const [addRankDialogOpen, setAddRankDialogOpen] = useState(false);
  const [createRankDialogOpen, setCreateRankDialogOpen] = useState(false);
  
  // Form values
  const [newRank, setNewRank] = useState({ name: "", description: "", isSystem: false });
  const [selectedRank, setSelectedRank] = useState<number | null>(null);
  const [banReason, setBanReason] = useState("");
  const [muteReason, setMuteReason] = useState("");
  const [muteDuration, setMuteDuration] = useState("3600"); // Default 1 hour
  const [activityPoints, setActivityPoints] = useState("10");
  const [roleToAssign, setRoleToAssign] = useState("");

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
    enabled: user?.role === "admin" || user?.role === "owner"
  });

  const { data: ranks = [], isLoading: ranksLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/ranks'],
    enabled: user?.role === "admin" || user?.role === "owner"
  });

  const { data: userRanks = [], isLoading: userRanksLoading } = useQuery<UserRank[]>({
    queryKey: ['/api/admin/users', selectedUser, 'ranks'],
    enabled: !!selectedUser && (user?.role === "admin" || user?.role === "owner")
  });

  // Mutations
  const createRankMutation = useMutation({
    mutationFn: async (rankData: typeof newRank) => {
      const response = await fetch('/api/admin/ranks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rankData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create rank');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ranks'] });
      setCreateRankDialogOpen(false);
      setNewRank({ name: "", description: "", isSystem: false });
      toast({
        title: "Звание создано",
        description: "Новое звание успешно добавлено в систему"
      });
    }
  });

  const assignRankMutation = useMutation({
    mutationFn: async ({ userId, rankId }: { userId: number, rankId: number }) => {
      const response = await fetch(`/api/admin/users/${userId}/ranks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rankId, isActive: true })
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign rank');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users', selectedUser, 'ranks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setAddRankDialogOpen(false);
      setSelectedRank(null);
      toast({
        title: "Звание назначено",
        description: "Звание успешно назначено пользователю"
      });
    }
  });

  const removeRankMutation = useMutation({
    mutationFn: async ({ userId, rankId }: { userId: number, rankId: number }) => {
      const response = await fetch(`/api/admin/users/${userId}/ranks/${rankId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove rank');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users', selectedUser, 'ranks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Звание удалено",
        description: "Звание успешно удалено у пользователя"
      });
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number, reason: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        throw new Error('Failed to ban user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setBanDialogOpen(false);
      setBanReason("");
      toast({
        title: "Пользователь заблокирован",
        description: "Пользователь успешно заблокирован"
      });
    }
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to unban user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Пользователь разблокирован",
        description: "Пользователь успешно разблокирован"
      });
    }
  });

  const muteUserMutation = useMutation({
    mutationFn: async ({ userId, duration, reason }: { userId: number, duration: number, reason: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/mute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration, reason })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mute user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setMuteDialogOpen(false);
      setMuteReason("");
      toast({
        title: "Пользователь заглушен",
        description: "Пользователь успешно заглушен"
      });
    }
  });

  const unmuteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}/unmute`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to unmute user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Заглушение снято",
        description: "Заглушение пользователя успешно снято"
      });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setRoleToAssign("");
      toast({
        title: "Роль обновлена",
        description: "Роль пользователя успешно обновлена"
      });
    }
  });

  const addActivityPointsMutation = useMutation({
    mutationFn: async ({ userId, points }: { userId: number, points: number }) => {
      const response = await fetch(`/api/admin/users/${userId}/add-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add activity points');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setActivityPoints("10");
      toast({
        title: "Активность добавлена",
        description: "Очки активности успешно добавлены"
      });
    }
  });
  
  // Authorization check
  if (user?.role !== "admin" && user?.role !== "owner") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Доступ запрещен</h1>
        <p className="text-muted-foreground mt-2">У вас недостаточно прав для доступа к этой странице</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Панель разработчика</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/ranks'] });
            if (selectedUser) {
              queryClient.invalidateQueries({ queryKey: ['/api/admin/users', selectedUser, 'ranks'] });
            }
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users"><User className="mr-2 h-4 w-4" /> Пользователи</TabsTrigger>
          <TabsTrigger value="ranks"><Award className="mr-2 h-4 w-4" /> Звания</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <div className="grid gap-6">
            {usersLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {users.map((user: any) => (
                  <Card key={user.id} className={user.isBanned ? "border-destructive" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.displayName} 
                                className="w-10 h-10 rounded-full object-cover" 
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {user.displayName}
                              {user.role === "owner" && <Badge className="bg-yellow-500">Владелец</Badge>}
                              {user.role === "admin" && <Badge className="bg-blue-500">Админ</Badge>}
                              {user.role === "moderator" && <Badge className="bg-green-500">Модератор</Badge>}
                              {user.isBanned && <Badge variant="destructive">Заблокирован</Badge>}
                              {user.isMuted && <Badge variant="outline" className="border-yellow-500 text-yellow-500">Заглушен</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              @{user.username} • {user.rank}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedUser(user.id);
                              setAddRankDialogOpen(true);
                            }}
                          >
                            <Award className="h-4 w-4 mr-1" />
                            Звание
                          </Button>
                          
                          {user.role !== "owner" && (
                            <Select
                              value={roleToAssign}
                              onValueChange={(value) => {
                                setRoleToAssign(value);
                                updateRoleMutation.mutate({ userId: user.id, role: value });
                              }}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Роль" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Пользователь</SelectItem>
                                <SelectItem value="moderator">Модератор</SelectItem>
                                {user?.role === "owner" && (
                                  <SelectItem value="admin">Админ</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user.id);
                              const points = parseInt(activityPoints);
                              if (!isNaN(points)) {
                                addActivityPointsMutation.mutate({ userId: user.id, points });
                              }
                            }}
                          >
                            +активность
                          </Button>
                          
                          {user.isMuted ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => unmuteUserMutation.mutate(user.id)}
                            >
                              <VolumeX className="h-4 w-4 mr-1" />
                              Размутить
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user.id);
                                setMuteDialogOpen(true);
                              }}
                            >
                              <Volume2 className="h-4 w-4 mr-1" />
                              Заглушить
                            </Button>
                          )}
                          
                          {user.isBanned ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => unbanUserMutation.mutate(user.id)}
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Разблокировать
                            </Button>
                          ) : (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user.id);
                                setBanDialogOpen(true);
                              }}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Бан
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    {selectedUser === user.id && userRanks && (
                      <CardContent className="pt-2">
                        <div className="bg-muted rounded-md p-3">
                          <div className="font-medium mb-2">Звания пользователя:</div>
                          <div className="flex flex-wrap gap-2">
                            {userRanks.length > 0 ? userRanks.map((userRank: UserRank) => (
                              <Badge 
                                key={userRank.rankId} 
                                className={`${userRank.isActive ? 'bg-primary' : 'bg-muted-foreground'} cursor-pointer flex items-center gap-1`}
                                onClick={() => removeRankMutation.mutate({ userId: user.id, rankId: userRank.rankId })}
                              >
                                {userRank.rank.name} &times;
                              </Badge>
                            )) : (
                              <div className="text-sm text-muted-foreground">Нет дополнительных званий</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="ranks">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">Все звания</h2>
            <Button onClick={() => setCreateRankDialogOpen(true)}>
              Создать звание
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ranksLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {ranks.map((rank: any) => (
                  <Card key={rank.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        {rank.name}
                        {rank.isSystem && (
                          <Badge variant="outline" className="ml-2">
                            Системное
                          </Badge>
                        )}
                      </CardTitle>
                      {rank.level && (
                        <CardDescription>
                          Уровень: {rank.level}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {rank.description || 'Нет описания'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Rank Dialog */}
      <Dialog open={addRankDialogOpen} onOpenChange={setAddRankDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Назначить звание</DialogTitle>
            <DialogDescription>
              Выберите звание, которое хотите назначить пользователю.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Select onValueChange={(value) => setSelectedRank(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите звание" />
              </SelectTrigger>
              <SelectContent>
                {ranks?.map((rank: any) => (
                  <SelectItem key={rank.id} value={rank.id.toString()}>
                    {rank.name} {rank.isSystem && "(Системное)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRankDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={() => {
                if (selectedUser && selectedRank) {
                  assignRankMutation.mutate({ userId: selectedUser, rankId: selectedRank });
                }
              }}
              disabled={!selectedRank}
            >
              Назначить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Rank Dialog */}
      <Dialog open={createRankDialogOpen} onOpenChange={setCreateRankDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новое звание</DialogTitle>
            <DialogDescription>
              Введите информацию для нового звания.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="rankName" className="text-sm font-medium">
                Название звания
              </label>
              <Input
                id="rankName"
                value={newRank.name}
                onChange={(e) => setNewRank({ ...newRank, name: e.target.value })}
                placeholder="Введите название звания"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="rankDesc" className="text-sm font-medium">
                Описание (необязательно)
              </label>
              <Textarea
                id="rankDesc"
                value={newRank.description}
                onChange={(e) => setNewRank({ ...newRank, description: e.target.value })}
                placeholder="Введите описание звания"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSystemRank"
                checked={newRank.isSystem}
                onChange={(e) => setNewRank({ ...newRank, isSystem: e.target.checked })}
              />
              <label htmlFor="isSystemRank" className="text-sm font-medium">
                Системное звание (для автоматического присвоения)
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRankDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={() => createRankMutation.mutate(newRank)}
              disabled={!newRank.name}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заблокировать пользователя</DialogTitle>
            <DialogDescription>
              Введите причину блокировки.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="banReason" className="text-sm font-medium">
                Причина блокировки
              </label>
              <Textarea
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Укажите причину блокировки"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (selectedUser && banReason) {
                  banUserMutation.mutate({ userId: selectedUser, reason: banReason });
                }
              }}
              disabled={!banReason}
            >
              Заблокировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Mute Dialog */}
      <Dialog open={muteDialogOpen} onOpenChange={setMuteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заглушить пользователя</DialogTitle>
            <DialogDescription>
              Введите причину и продолжительность заглушения.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="muteDuration" className="text-sm font-medium">
                Продолжительность (в секундах)
              </label>
              <Select defaultValue={muteDuration} onValueChange={setMuteDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите длительность" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">5 минут</SelectItem>
                  <SelectItem value="900">15 минут</SelectItem>
                  <SelectItem value="3600">1 час</SelectItem>
                  <SelectItem value="86400">1 день</SelectItem>
                  <SelectItem value="604800">1 неделя</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="muteReason" className="text-sm font-medium">
                Причина заглушения
              </label>
              <Textarea
                id="muteReason"
                value={muteReason}
                onChange={(e) => setMuteReason(e.target.value)}
                placeholder="Укажите причину заглушения"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMuteDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant="default"
              onClick={() => {
                if (selectedUser && muteReason && muteDuration) {
                  muteUserMutation.mutate({ 
                    userId: selectedUser, 
                    reason: muteReason,
                    duration: parseInt(muteDuration)
                  });
                }
              }}
              disabled={!muteReason || !muteDuration}
            >
              Заглушить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
