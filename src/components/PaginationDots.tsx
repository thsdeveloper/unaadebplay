import React from 'react';
import { Box, HStack, Circle } from 'native-base';
import colors from "../constants/colors";

const PaginationDots = ({ data, activeIndex }) => {
    return (
        <HStack space={2} alignItems="center" justifyContent="center" mt={4}>
        {data.map((_, index) => (
                <Circle
                    key={index}
            size={2}
            bg={activeIndex === index ? colors.primary : 'muted.400'}
    />
))}
    </HStack>
);
};

export default PaginationDots;
