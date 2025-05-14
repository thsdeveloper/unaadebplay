import React from 'react';
import {VStack} from "@/components/ui/vstack";
import {HStack} from "@/components/ui/hstack";
import {Skeleton} from "@/components/ui/skeleton";

const UserSkeleton = () => {
    return (
        <VStack mt={2} space={4} width="100%" px={2}>
            {Array.from({length: 5}).map((_, index) => (
                <HStack space={2} alignItems="center" key={index}>
                    <Skeleton size="16" rounded={'full'} startColor="text.400" endColor={'text.300'}/>
                    <VStack space={2} flex={1}>
                        <Skeleton.Text lines={1} width="80%" startColor="text.400" endColor={'text.300'}/>
                        <Skeleton.Text lines={1} width="60%" startColor="text.400" endColor={'text.300'}/>
                        <Skeleton.Text lines={1} width="20%" startColor="text.400" endColor={'text.300'}/>
                    </VStack>
                </HStack>
            ))}
        </VStack>
    );
};

export default UserSkeleton;
