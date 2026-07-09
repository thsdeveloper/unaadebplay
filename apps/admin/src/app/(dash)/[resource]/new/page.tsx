import { notFound } from 'next/navigation';
import { getResource } from '@/resources/registry';
import { ResourceCreate } from './ResourceCreate';

export default async function Page({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!getResource(resource)) notFound();
  return <ResourceCreate resourceKey={resource} />;
}
