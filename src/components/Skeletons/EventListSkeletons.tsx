import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';

interface EventListSkeletonsProps {
    count?: number;
}

const EventCardSkeleton = React.memo(() => (
    <Box className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
        <Skeleton className="h-48 w-full" />
        
        <VStack className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            
            <HStack className="space-x-4">
                <HStack className="space-x-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded" />
                </HStack>
                <Skeleton className="h-6 w-16 rounded-full" />
            </HStack>
            
            <HStack className="space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32 rounded" />
            </HStack>
        </VStack>
        
        <Box className="border-t border-gray-100 px-4 py-3">
            <HStack className="items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <VStack className="space-y-1">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                </VStack>
            </HStack>
        </Box>
    </Box>
));

EventCardSkeleton.displayName = 'EventCardSkeleton';

const EventListSkeletons: React.FC<EventListSkeletonsProps> = ({ count = 3 }) => {
    return (
        <VStack className="p-4 space-y-4">
            <Box className="bg-white px-5 py-3 mb-2 border-b border-gray-200">
                <HStack className="items-center space-x-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-40 rounded" />
                </HStack>
            </Box>
            
            {Array.from({ length: count }).map((_, index) => (
                <EventCardSkeleton key={index} />
            ))}
        </VStack>
    );
};

export default EventListSkeletons;