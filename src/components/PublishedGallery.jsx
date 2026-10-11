import WorkGallery from './WorkGallery';
import { usePublishedWorks } from '../lib/works';

export default function PublishedGallery() {
  const { works, status } = usePublishedWorks();

  if (status !== 'ready' || works.length === 0) {
    return (
      <p className="work-note">
        The work is loading, see our{' '}
        <a href="https://ig.me/m/lyfetattooos">Instagram</a>.
      </p>
    );
  }

  return <WorkGallery works={works} />;
}
