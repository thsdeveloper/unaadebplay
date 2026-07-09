import React from 'react';
import colors from "../constants/colors";
import {HStack} from "@/components/ui/hstack";
import {Circle} from "react-native-svg";

const PaginationDots = ({ data, activeIndex }) => {
    return (
        <HStack space={2} alignItems="center" justifyContent="center" mt={4}>
        {data && data.map((_, index) => (
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
