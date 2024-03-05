import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {Icon, Pressable, Text, VStack} from "native-base";
import {Entypo} from "@expo/vector-icons";
import {useState} from "react";
import colors from "@/constants/colors";


export default function LikedIcon(){
    // Valor compartilhado para a escala da animação
    const scale = useSharedValue(1);
    const [liked, setLiked] = useState(false);

    // Ação ao pressionar o coração
    const handlePress = () => {
        setLiked(!liked);
        scale.value = withSpring(1.8, { stiffness: 800, damping: 300 }, () => {
            scale.value = withSpring(1);
        });
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <>
           <VStack>
               <Pressable onPress={handlePress}>
                   <Animated.View style={animatedStyle}>
                       <Icon as={Entypo} name={liked ? "heart" : "heart-outlined"} size="2xl" color={colors.light} />
                   </Animated.View>
               </Pressable>
               <Text color={colors.light}>Curtir</Text>
           </VStack>
        </>
    );
}