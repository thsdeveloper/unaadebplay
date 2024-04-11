import React, {useContext, useEffect, useRef} from 'react';
import {Box, HStack, Text, IconButton} from 'native-base';
import {MaterialIcons} from '@expo/vector-icons';
import {ImageBackground, PanResponder, Animated, TouchableOpacity} from 'react-native';
import ConfigContext from '@/contexts/ConfigContext';
import {LinearGradient} from 'expo-linear-gradient';
import {RepertoriesTypes} from '@/types/RepertoriesTypes';
import {Image} from '@/components/Image';

interface CollapsedViewProps {
    album: RepertoriesTypes | null;
    isPlaying: boolean;
    onPlayPausePress: () => void;
    duration: number;
    stopSound: () => void;
    onPress: () => void;
}

const CollapsedView = ({album, isPlaying, onPlayPausePress, duration, stopSound, onPress}: CollapsedViewProps) => {
    const config = useContext(ConfigContext);
    const pan = useRef(new Animated.ValueXY()).current;
    const panResponderRef = useRef(PanResponder.create({})); // Inicializa com um objeto vazio
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        panResponderRef.current = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (e, gesture) => {
                if (Math.abs(gesture.dx) > 10) { // Verifica se o movimento é significativo para tratar como arrastar
                    Animated.event([null, { dx: pan.x }], { useNativeDriver: false })(e, gesture);
                    const distanceMoved = Math.abs(gesture.dx);
                    const newOpacity = 1 - (0.5 * Math.min(distanceMoved / 100, 1));
                    opacity.setValue(newOpacity);
                }
            },
            onPanResponderRelease: (e, gestureState) => {
                if (gestureState.dx > 100) {
                    stopSound();
                } else {
                    Animated.parallel([
                        Animated.spring(pan, {
                            toValue: {x: 0, y: 0},
                            useNativeDriver: false,
                        }),
                        Animated.spring(opacity, {
                            toValue: 1,
                            useNativeDriver: false,
                        }),
                    ]).start();
                }
            },
        });
    }, [stopSound]);

    return (
        <Animated.View
            {...panResponderRef.current.panHandlers}
            style={{
                transform: pan.getTranslateTransform(),
                opacity: opacity,// Utiliza getTranslateTransform para maior clareza
            }}
        >
            <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
                <Box position="absolute" width="100%" top={-80} height={20} padding={2}>
                    <ImageBackground source={{uri: `${config.url_api}/assets/${album?.image_cover.filename_disk}`}}>
                        <LinearGradient colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.7)']}>
                            <HStack space={2} alignItems="center" justifyContent="space-between">
                                <HStack alignItems="center" space={2}>
                                    <Image width={16} height={16} assetId={album?.image_cover.id}/>
                                    <Box>
                                        <Text color="white" bold>
                                            {album?.title}
                                        </Text>
                                        <Text color="white">{album?.artist}</Text>
                                    </Box>
                                </HStack>
                                <HStack pr={4}>
                                    <IconButton
                                        icon={<MaterialIcons name="stop" size={24} color="white"/>}
                                        onPress={stopSound}
                                        borderRadius="full"
                                    />
                                    <IconButton
                                        icon={<MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={24}
                                                             color="white"/>}
                                        onPress={onPlayPausePress}
                                        borderRadius="full"
                                    />
                                </HStack>
                            </HStack>
                        </LinearGradient>
                    </ImageBackground>
                </Box>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default CollapsedView;
