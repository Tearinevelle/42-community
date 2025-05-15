import BlogPost from "./BlogPost";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function BlogSection() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['/api/blog/recent'],
  });

  // Use actual data from API
  const displayPosts = posts || [];

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-montserrat">Последние публикации</h2>
        <Link href="/blog">
          <a className="text-secondary flex items-center gap-1 hover:underline">
            <span>Все публикации</span>
            <i className="fas fa-chevron-right text-sm"></i>
          </a>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayPosts.map((post) => (
          <BlogPost key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
