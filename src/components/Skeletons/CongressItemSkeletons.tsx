import React from 'react';
import {VStack} from "@/components/ui/vstack";
import {Skeleton} from "@/components/ui/skeleton";

interface PropsUserSkeleton{
    windowWidth: number
}

const UserSkeleton = ({windowWidth}: PropsUserSkeleton) => {
    return (
        <VStack mt={2} space={4} width={'100%'} px={2}>
            {Array.from({length: 1}).map((_, index) => (
                <VStack space={2} alignItems="center" key={index} pb={4}>
                    <Skeleton startColor="text.400" endColor={'text.300'}
                              height={windowWidth * 1.1}
                              borderRadius={10}
                              width={windowWidth * 0.8}
                             />
                    <Skeleton lines={1} width="20%" startColor="text.400" endColor={'text.300'}/>
                    <Skeleton lines={1} width="4%" startColor="text.400" endColor={'text.300'}/>
                    <Skeleton lines={1} width="70%" startColor="text.400" endColor={'text.300'}/>
                    <Skeleton lines={1} width="50%" startColor="text.400" endColor={'text.300'}/>
                </VStack>
            ))}
        </VStack>
    );
};

export default UserSkeleton;
