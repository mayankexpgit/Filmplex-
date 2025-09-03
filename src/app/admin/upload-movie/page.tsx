import UploadMovie from '@/components/admin/upload-movie';
import { Suspense } from 'react';

function UploadMoviePageContent() {
  return (
    <div className="container mx-auto py-8 md:py-12">
      <UploadMovie />
    </div>
  );
}

export default function UploadMoviePage() {
  return (
    <Suspense>
      <UploadMoviePageContent />
    </Suspense>
  )
}
