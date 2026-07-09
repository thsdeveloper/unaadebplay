import React from 'react';
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Box } from "@/components/ui/box";

const UserListSkeletons = () => {
    return (
        <Box className="flex-1 bg-gray-50 dark:bg-gray-950">
            <VStack className="px-4 pt-4 pb-2 space-y-4 bg-white dark:bg-gray-900">
                {/* Search Bar Skeleton */}
                <Skeleton className="h-12 w-full rounded-xl" />
                
                {/* Filter Section Skeleton */}
                <HStack className="justify-between items-center">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </HStack>
            </VStack>

            <VStack className="px-4 space-y-4 mt-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <HStack className="space-x-3 items-center" key={index}>
                        {/* Avatar Skeleton */}
                        <Skeleton className="h-14 w-14 rounded-full" />
                        
                        {/* User Info Skeleton */}
                        <VStack className="flex-1 space-y-2">
                            <HStack className="items-center space-x-2">
                                <SkeletonText className="h-5 w-32" />
                                <Skeleton className="h-4 w-12 rounded-full" />
                            </HStack>
                            <SkeletonText className="h-4 w-48" />
                            <HStack className="space-x-2">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </HStack>
                        </VStack>
                        
                        {/* Chevron Skeleton */}
                        <Skeleton className="h-5 w-5" />
                    </HStack>
                ))}
            </VStack>
        </Box>
    );
};

export default UserListSkeletons;
