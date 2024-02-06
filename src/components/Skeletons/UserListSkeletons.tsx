import React from 'react';
import { Skeleton, VStack, HStack } from 'native-base';

const UserSkeleton = () => {
    return (
        <VStack space={4} width="100%" px={4}>
            {Array.from({ length: 5 }).map((_, index) => (
               <>
                   <HStack space={3} alignItems="center">
                       <Skeleton size="16" rounded={'full'} startColor="text.400" endColor={'text.300'} />
                       <VStack space={2} flex={1}>
                           <Skeleton.Text lines={1} width="80%" startColor="text.400" endColor={'text.300'}/>
                           <Skeleton.Text lines={1} width="60%" startColor="text.400" endColor={'text.300'}/>
                           <Skeleton.Text lines={1} width="20%" startColor="text.400" endColor={'text.300'}/>
                       </VStack>
                   </HStack>
                   <Skeleton size={"0.3"} lines={1} width="100%" startColor="text.400" endColor={'text.300'}/>
               </>
            ))}
        </VStack>
    );
};

export default UserSkeleton;