import { notFound } from "next/navigation";

const movies = [
  { id: "6", slug: "war-2", title: "War 2", description: "Action movie War 2 Description" },
  { id: "7", slug: "thalavi", title: "Thalaivii", description: "Biopic of Jayalalithaa" },
  { id: "8", slug: "kgf-3", title: "KGF 3", description: "Upcoming blockbuster KGF 3" },
];

export default function MoviePage({ params }: { params: { slug: string } }) {
  const movie = movies.find((m) => m.slug === params.slug);

  if (!movie) {
    return notFound();
  }

  return (
    <main className="p-6 min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
        <p className="text-lg text-gray-300">{movie.description}</p>
      </div>
    </main>
  );
}
