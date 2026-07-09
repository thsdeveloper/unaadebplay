import React from 'react';
import {Center} from "@/components/ui/center";
import {HStack} from "@/components/ui/hstack";
import {Skeleton} from "@/components/ui/skeleton";
import {VStack} from "@/components/ui/vstack";

const SkeletonItem = ({ count = 1 }) => {

    // Criar um array com base na contagem fornecida
    const countArray = [...Array(count)];

    return (
        countArray.map((_, index) => (
            <Center key={index} w="100%">
                <HStack w="100%" maxW="100%" mb={2} space={4} rounded="md" p="4">
                    <Skeleton flex="1" h="20" rounded="md" startColor="coolGray.200" />
                    <VStack flex="3" space="2">
                        <Skeleton />
                    </VStack>
                </HStack>
            </Center>
        ))
    )
}

export default SkeletonItem;
