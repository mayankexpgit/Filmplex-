import UploadMovie from '@/components/admin/upload-movie';
import { Suspense } from 'react';

function UploadMoviePageContent() {
  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <UploadMovie />
      </div>
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
