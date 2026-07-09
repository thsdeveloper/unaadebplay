import React from 'react';
import {VStack} from "@/components/ui/vstack";
import {Skeleton} from "@/components/ui/skeleton";

export function HospedagemSkeleton() {
    return (
        <VStack mt={2} space={4} width={'100%'} px={2}>
            {Array.from({length: 1}).map((_, index) => (
                <VStack space={2} key={index} pb={4}>
                    <Skeleton startColor="text.400" endColor={'text.300'} width={'100%'}/>
                    <Skeleton.Text lines={2} width="50%" startColor="text.400" endColor={'text.300'}/>

                    <Skeleton startColor="text.400" endColor={'text.300'} width={'100%'}/>
                    <Skeleton.Text lines={2} width="50%" startColor="text.400" endColor={'text.300'}/>

                    <Skeleton startColor="text.400" endColor={'text.300'} width={'100%'}/>
                    <Skeleton.Text lines={2} width="50%" startColor="text.400" endColor={'text.300'}/>
                </VStack>
            ))}
        </VStack>
    );
}
