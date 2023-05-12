import React, {useState, useEffect, useContext, useCallback} from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    Dimensions,
    ImageBackground,
    useWindowDimensions
} from 'react-native';
import {Box, HStack, Text, IconButton, Slider, VStack, ScrollView, Image} from 'native-base';
import {AntDesign, MaterialIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {Audio} from 'expo-av';
import {useAudioPlayer} from "../contexts/AudioPlayerContext";

import ConfigContext from "../contexts/ConfigContext";
import colors from "../constants/colors";
import {Sound} from "expo-av/build/Audio/Sound";
import { useFocusEffect } from '@react-navigation/native';


const {height: screenHeight} = Dimensions.get('window');

const AudioPlayer = ({audioURI, onClose}) => {
    const [sound, setSound] = useState<Sound>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [heightAnimation] = useState(new Animated.Value(60));
    const {album} = useAudioPlayer();
    const config = useContext(ConfigContext);

    useEffect(() => {
        loadSound();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [audioURI]);

    useFocusEffect(
        React.useCallback(() => {
            const onUnload = async () => {
                if (sound) {
                    await sound.unloadAsync();
                }
            };

            return () => onUnload();
        }, [sound])
    );

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        Animated.timing(heightAnimation, {
            toValue: isExpanded ? 60 : screenHeight,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    };


    const loadSound = useCallback(async () => {
        if (sound) {
            await sound.unloadAsync();
        }

        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioURI },
                { shouldPlay: true, staysActiveInBackground: true },
            );

            console.log('Audio loaded successfully');  // log for debugging

            setSound(newSound);
            setIsPlaying(true);

            newSound.setOnPlaybackStatusUpdate((status) => {
                setPosition(status.positionMillis);
                setDuration(status.durationMillis);
            });
        } catch (error) {
            console.error('Error loading audio', error);  // log error for debugging
        }
    }, [audioURI]);



    const playPauseSound = useCallback(async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    }, [sound, isPlaying]);

    const stopSound = useCallback(async () => {
        if (sound) {
            await sound.unloadAsync();
            setIsPlaying(false);
            setPosition(0);
            onClose();
        }
    }, [sound, onClose]);

    async function handleSliderValueChange(value) {
        if (sound) {
            await sound.setPositionAsync(value * 1000);
            setPosition(value * 1000);
        }
    }

    const duracao = Math.round(duration / 1000)
    const posicao = Math.round(position / 1000)

    const window = useWindowDimensions();
    const contentWidth = window.width;
    const gradientColors = ['rgba(0,0,0,1.0)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)'];


    return (
        <Animated.View style={{height: heightAnimation}}>
            <ImageBackground
                source={{uri: `${config.url_api}/assets/${album?.image_cover.filename_disk}`}} // Altere para a URL correta da imagem
                style={{height: '100%'}}
                resizeMode="cover"
            >
                <LinearGradient colors={gradientColors} style={{height: '100%'}}>

                    {/* Render your additional options here when expanded */}
                    {isExpanded && (
                        <>
                            <HStack space={4} justifyContent={"space-between"}>
                                <IconButton icon={<AntDesign name="down" size={24} color="white"/>}
                                            onPress={toggleExpanded}/>
                                <IconButton
                                    icon={<MaterialIcons name="close" size={24} color="white"/>}
                                    onPress={stopSound}
                                />
                            </HStack>
                            <ScrollView>
                                <Box>
                                    <VStack alignItems="center">
                                        <Image source={{uri: `${config.url_api}/assets/${album?.image_cover.id}`}} alt="Alternate Text" size="2xl"/>
                                    </VStack>
                                </Box>
                                <Box pt={2}>
                                    <Text fontSize={"2xl"} color={colors.text}
                                          textAlign={"center"}>{album?.title}</Text>
                                    <Text color={colors.text}
                                          textAlign={"center"}>{album?.artist} - {album?.category[0]}</Text>
                                </Box>
                                <Box>
                                    <HStack space={2} justifyContent="center" alignItems={"center"}
                                            alignContent={'center'} textAlign={"center"}>
                                        <Text color={colors.text}>{posicao}</Text>

                                        <Slider
                                            w="3/4"
                                            minValue={0}
                                            maxValue={duracao}
                                            value={posicao}
                                            onChangeEnd={handleSliderValueChange}
                                            step={1}
                                        >
                                            <Slider.Track>
                                                <Slider.FilledTrack/>
                                            </Slider.Track>
                                            <Slider.Thumb/>
                                        </Slider>

                                        <Text color={colors.text}>{duracao}</Text>
                                    </HStack>
                                </Box>
                                <HStack justifyContent="center" p={4}>
                                    <TouchableOpacity onPress={playPauseSound}>
                                        <Box backgroundColor={colors.text} rounded={"full"} p={2}>
                                            <MaterialIcons
                                                name={isPlaying ? 'pause' : 'play-arrow'}
                                                size={40}
                                                color={colors.accent}
                                            />
                                        </Box>
                                    </TouchableOpacity>
                                </HStack>
                            </ScrollView>
                        </>
                    )}
                    {/* Rest of the AudioPlayer layout */}
                    {!isExpanded && (
                        <TouchableOpacity onPress={toggleExpanded} activeOpacity={1}>
                            <Box>
                                <HStack space={4} alignItems={"center"} pr={4}>
                                    <Box>
                                        <Image source={{uri: `${config.url_api}/assets/${album?.image_cover.id}`}} alt="Alternate Text" size="16"/>
                                    </Box>
                                    <VStack flex={1} justifyContent="center">
                                        <Text color="white" fontWeight={"bold"}>{album?.title}</Text>
                                        <Text color="white">{album?.artist}</Text>
                                    </VStack>
                                    <VStack alignItems="center">
                                        <TouchableOpacity onPress={playPauseSound}>
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

export default AudioPlayer;
