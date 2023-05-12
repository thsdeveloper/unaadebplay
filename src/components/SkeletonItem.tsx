import React from 'react';
import { Center, HStack, VStack, Skeleton } from 'native-base';

const SkeletonItem = ({ count = 1 }) => {

    // Criar um array com base na contagem fornecida
    const countArray = [...Array(count)];

    return (
        countArray.map((_, index) => (
            <Center key={index} w="100%">
                <HStack w="95%" maxW="100%" mb={2} space={4} rounded="md" _dark={{
                    borderColor: "coolGray.500"
                }} _light={{
                    borderColor: "coolGray.200"
                }} p="4">
                    <Skeleton flex="1" h="20" rounded="md" startColor="coolGray.100" />
                    <VStack flex="3" space="4">
                        <Skeleton.Text />
                    </VStack>
                </HStack>
            </Center>
        ))
    )
}

export default SkeletonItem;
