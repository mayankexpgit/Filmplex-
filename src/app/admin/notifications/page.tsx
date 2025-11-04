
import UpcomingReleasesManager from '@/components/admin/upcoming-releases';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <UpcomingReleasesManager />
      </div>
    </div>
  );
}
