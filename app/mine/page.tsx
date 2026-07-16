import type { Metadata } from 'next';
import { ArchiveList } from './archive-list';

export const metadata: Metadata = {
  title: 'Mine kvitteringer — Tapbon',
  robots: { index: false },
};

export default function MinePage() {
  return <ArchiveList />;
}
