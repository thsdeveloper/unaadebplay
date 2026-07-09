import { notFound } from 'next/navigation';
import { getResource } from '@/resources/registry';
import { ResourceList } from './ResourceList';

export default async function Page({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!getResource(resource)) notFound();
  return <ResourceList resourceKey={resource} />;
}
