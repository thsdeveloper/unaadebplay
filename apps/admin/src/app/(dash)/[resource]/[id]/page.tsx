import { notFound } from 'next/navigation';
import { getResource } from '@/resources/registry';
import { ResourceEdit } from './ResourceEdit';

export default async function Page({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  if (!getResource(resource)) notFound();
  return <ResourceEdit resourceKey={resource} id={id} />;
}
