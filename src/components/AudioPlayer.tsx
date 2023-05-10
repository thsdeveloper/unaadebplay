import React, {useState, useEffect, useContext} from 'react';
import {TouchableOpacity, StyleSheet, Animated, Easing, Dimensions, ImageBackground} from 'react-native';
import {Box, HStack, Text, IconButton, Slider, Flex, VStack} from 'native-base';
import {AntDesign, MaterialIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {Audio} from 'expo-av';
import {useAudioPlayer} from "../contexts/AudioPlayerContext";

import {Image} from "./Image";
import ConfigContext from "../contexts/ConfigContext";

const {height: screenHeight} = Dimensions.get('window');

const AudioPlayer = ({audioURI, onClose}) => {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [heightAnimation] = useState(new Animated.Value(60));
    const {album} = useAudioPlayer();
    const config = useContext(ConfigContext);

    useEffect(() => {
        if (audioURI) {
            playSound();
        }
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [audioURI]);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        Animated.timing(heightAnimation, {
            toValue: isExpanded ? 60 : screenHeight,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    };


    async function playSound() {
        if (sound) {
            await sound.unloadAsync();
        }

        console.log('Loading Sound');
        const {sound: newSound} = await Audio.Sound.createAsync(
            {uri: audioURI},
            { shouldPlay: true, staysActiveInBackground: true },
        );
        setSound(newSound);

        newSound.setOnPlaybackStatusUpdate((status) => {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
        });

        console.log('Playing Sound');
        await newSound.playAsync();
        setIsPlaying(true);
    }

    async function pauseSound() {
        if (sound) {
            await sound.pauseAsync();
            setIsPlaying(false);
        }
    }

    async function stopSound() {
        if (sound) {
            await sound.unloadAsync();
            setIsPlaying(false);
            setPosition(0);
            onClose();
        }
    }

    async function handleSliderValueChange(value) {
        if (sound) {
            await sound.setPositionAsync(value);
            setPosition(value);
        }
    }

    return (
        <Animated.View style={{height: heightAnimation}}>
            <ImageBackground
                source={{uri: `${config.url_api}/assets/${album?.image_cover.filename_disk}`}} // Altere para a URL correta da imagem
                style={[styles.container, {height: '100%'}]}
                resizeMode="cover"
            >
                <LinearGradient
                    // Transparente no início e no final, escuro no centro
                    colors={['rgba(0,0,0,1.0)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)']}
                    style={{height: '100%'}}
                >

                    {/* Render your additional options here when expanded */}
                    {isExpanded && (
                        <Box>
                            <Box>
                                <HStack space={4}>
                                    <IconButton icon={<AntDesign name="down" size={24} color="white"/>}
                                                onPress={toggleExpanded}/>
                                    <IconButton
                                        icon={<MaterialIcons name="close" size={24} color="white"/>}
                                        onPress={stopSound}
                                    />
                                </HStack>
                                <VStack alignItems="center">
                                    <Image width={300} height={300} assetId={album?.image_cover.id} />
                                </VStack>
                            </Box>

                            <Text>{album?.title}</Text>
                            <Text>{album?.content}</Text>
                            <Text color="white">{position / 1000}s / {duration / 1000}s</Text>
                        </Box>
                    )}
                    {/* Rest of the AudioPlayer layout */}
                    {!isExpanded && (
                        <TouchableOpacity onPress={toggleExpanded} activeOpacity={1}>
                            <Box style={styles.container}>
                                <HStack space={4} alignItems={"center"} pr={4}>
                                    <Box>
                                        <Image width={16} height={16} assetId={album?.image_cover.id}/>
                                    </Box>
                                    <VStack flex={1} justifyContent="center">
                                        <Text color="white" fontWeight={"bold"}>{album?.title}</Text>
                                        <Text color="white">{album?.artist}</Text>
                                    </VStack>
                                    <VStack alignItems="center">
                                        <TouchableOpacity onPress={isPlaying ? pauseSound : playSound}>
                                            <MaterialIcons
                                                name={isPlaying ? 'pause' : 'play-arrow'}
                                                size={40}
                                                color="white"
                                            />
                                        </TouchableOpacity>
                                    </VStack>
                                </HStack>
                            </Box>
                        </TouchableOpacity>
                    )}
                </LinearGradient>
            </ImageBackground>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        // backgroundColor: '#1DB954',
    },
});

export default AudioPlayer;
