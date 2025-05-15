import UserProfileCard from "./UserProfileCard";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function PopularUsersSection() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['/api/users/popular'],
  });

  // Use actual data from API
  const displayUsers = users || [];

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-montserrat">Популярные пользователи</h2>
        <Link href="/users">
          <a className="text-secondary flex items-center gap-1 hover:underline">
            <span>Все пользователи</span>
            <i className="fas fa-chevron-right text-sm"></i>
          </a>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayUsers.map((user) => (
          <UserProfileCard key={user.id} user={user} />
        ))}
      </div>
    </section>
  );
}
