import React from 'react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Skeleton } from '@/components/ui/skeleton';
import { useColorScheme } from 'react-native';

export const NewsCardSkeleton = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Box 
      className={`rounded-xl overflow-hidden shadow-md ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <Skeleton className="h-48 w-full" />
      
      <VStack className="p-4" space="sm">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        
        <HStack className="items-center justify-between mt-2">
          <HStack className="items-center" space="sm">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </HStack>
          <Skeleton className="h-4 w-16" />
        </HStack>
      </VStack>
    </Box>
  );
};

export const NewsFeaturedSkeleton = () => {
  return (
    <Box className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
      <Skeleton className="absolute inset-0 w-full h-full" />
      
      <Box className="absolute bottom-0 left-0 right-0 p-6">
        <Skeleton className="h-6 w-24 mb-3" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-3" />
        
        <HStack className="items-center" space="md">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </HStack>
      </Box>
    </Box>
  );
};

export const NewsCompactSkeleton = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <HStack 
      className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
      space="md"
    >
      <Skeleton className="w-20 h-20 rounded-lg" />
      
      <VStack className="flex-1" space="xs">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </VStack>
      
      <Skeleton className="w-5 h-5" />
    </HStack>
  );
};

export const NewsDetailSkeleton = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <VStack space="lg">
      <Skeleton className="h-80 w-full" />
      
      <VStack className="p-4" space="lg">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        
        <HStack className="items-center justify-between">
          <HStack className="items-center" space="sm">
            <Skeleton className="w-10 h-10 rounded-full" />
            <VStack>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </VStack>
          </HStack>
          
          <HStack className="items-center" space="md">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </HStack>
        </HStack>
        
        <Skeleton className="h-px w-full" />
        
        <VStack space="md">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </VStack>
      </VStack>
    </VStack>
  );
};

interface NewsListSkeletonProps {
  count?: number;
  variant?: 'default' | 'featured' | 'compact';
}

export const NewsListSkeleton = ({ 
  count = 3, 
  variant = 'default' 
}: NewsListSkeletonProps) => {
  const SkeletonComponent = variant === 'featured' 
    ? NewsFeaturedSkeleton 
    : variant === 'compact' 
    ? NewsCompactSkeleton 
    : NewsCardSkeleton;
  
  return (
    <VStack space="md">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </VStack>
  );
};