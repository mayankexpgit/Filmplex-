import MovieList from '@/components/admin/movie-list';

export default function MovieListPage() {
  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <MovieList />
      </div>
    </div>
  );
}
