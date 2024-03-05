import React from 'react';
import {Skeleton, VStack, HStack, Box} from 'native-base';

const UserSkeleton = () => {
    return (
        <VStack mt={2} space={4} width="100%" px={2}>
            {Array.from({length: 1}).map((_, index) => (
                <VStack space={2} alignItems="center" key={index}>
                    <Skeleton startColor="text.400" endColor={'text.300'} height={"80"} borderRadius={10} width={'64'} mb={4}/>
                    <Skeleton.Text lines={1} width="80%" startColor="text.400" endColor={'text.300'}/>
                    <Skeleton.Text lines={1} width="60%" startColor="text.400" endColor={'text.300'}/>
                    <Skeleton.Text lines={1} width="30%" startColor="text.400" endColor={'text.300'}/>
                </VStack>
            ))}
        </VStack>
    );
};

export default UserSkeleton;