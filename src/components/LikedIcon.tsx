import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {Entypo} from "@expo/vector-icons";
import {useContext, useState} from "react";
import * as Linking from 'expo-linking';
import AlertContext from "@/contexts/AlertContext";
import {VStack} from "@/components/ui/vstack";
import {Pressable} from "react-native";
import {Icon} from "@/components/ui/icon";

interface PropsLikedIcon{
    color: string
    iconName: string
    title: string
}


export default function LikedIcon({color, iconName, title}: PropsLikedIcon){
    const scale = useSharedValue(1);
    const [liked, setLiked] = useState(false);
    const alert = useContext(AlertContext)

    // Função para abrir o aplicativo
    const openApp = async () => {
        await Linking.openURL('instagram://user?username=thspereira_');
    };

    // Ação ao pressionar o coração
    const handlePress = () => {
        setLiked(!liked);
        scale.value = withSpring(1.8, { stiffness: 800, damping: 300 }, () => {
            scale.value = withSpring(1);
        });
        openApp();
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <>
           <VStack alignItems={"center"} p={4}>
               <Pressable onPress={handlePress}>
                   <Animated.View style={animatedStyle}>
                       <Icon as={Entypo} name={liked ? iconName : iconName} size="2xl" color={color} />
                   </Animated.View>
               </Pressable>
               <Text color={color}>{title}</Text>
           </VStack>
        </>
    );
}
