import WorkGallery from './WorkGallery';
import { usePublishedWorks } from '../lib/works';
import { trackEvent } from '../utils/analytics';

export default function PublishedGallery() {
  const { works, status } = usePublishedWorks();

  if (status !== 'ready' || works.length === 0) {
    return (
      <p className="work-note">
        The work is loading, see our{' '}
        <a
          href="https://ig.me/m/lyfetattooos"
          onClick={() =>
            trackEvent('booking_click', { destination: 'instagram_dm', location: 'gallery' })
          }
        >
          Instagram
        </a>
        .
      </p>
    );
  }

  return <WorkGallery works={works} />;
}
