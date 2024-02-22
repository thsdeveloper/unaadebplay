import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Animated, Dimensions, Easing, ImageBackground, TouchableOpacity, useWindowDimensions} from 'react-native';
import {Box, Heading, HStack, IconButton, ScrollView, Slider, Spinner, Text, VStack} from 'native-base';
import {AntDesign, MaterialIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {Audio} from 'expo-av';
import ConfigContext from "../contexts/ConfigContext";
import colors from "../constants/colors";
import {Sound} from "expo-av/build/Audio/Sound";
import {useFocusEffect} from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import {getAssetURI} from "@/services/files";
import {getItem} from "@/services/items";
import {RepertoriesTypes} from "@/types/RepertoriesTypes";
import AlertContext from "@/contexts/AlertContext";
import {Image} from '@/components/Image'

const {height: screenHeight} = Dimensions.get('window');

const AudioPlayer = ({albumID, onClose}) => {
    const {width} = useWindowDimensions();
    const [sound, setSound] = useState<Sound>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [heightAnimation] = useState(new Animated.Value(60));
    const config = useContext(ConfigContext);

    const [album, setAlbum] = useState<RepertoriesTypes>(null);
    const [audioURI, setAudioURI] = useState<String | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const alert = useContext(AlertContext)


    useEffect(() => {
        const loadAlbumAndSound = async () => {
            setIsLoading(true)

            const params = {
                fields: '*.*,mp3.*',
            }
            const albumResponse = await getItem<RepertoriesTypes>('repertorios', albumID, params);
            console.log('albumResponse', albumResponse.mp3.id)


            setAlbum(albumResponse);
            const audioFile = await getAssetURI(albumResponse.mp3.id);
            console.log('audioFile', audioFile.id)

            setAudioURI(`${config.url_api}/assets/${audioFile.id}`);
            setIsLoading(false); // finalize o loading
        };
        loadAlbumAndSound();
    }, [albumID]);

    useEffect(() => {
        loadSound();
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

        if (!audioURI) {
            alert.error('Audio não encontrado')
            return;
        }

        try {
            const {sound: newSound} = await Audio.Sound.createAsync(
                {uri: audioURI},
                {shouldPlay: true, staysActiveInBackground: true},
            );

            alert.success('Música carregada com sucesso')

            setSound(newSound);
            setIsPlaying(true);
            setIsLoaded(true);  // Set isLoaded to true when the sound is loaded

            newSound.setOnPlaybackStatusUpdate((status) => {
                setPosition(status.positionMillis);
                setDuration(status.durationMillis);
            });
        } catch (error) {
            console.error('Error loading audio', error);  // log error for debugging
            setIsLoaded(false);  // Set isLoaded to false if there was an error loading the sound
        }
    }, [audioURI]);


    const playPauseSound = useCallback(async () => {
        if (sound && isLoaded) {  // Check that the sound is loaded before trying to play it
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    }, [sound, isPlaying, isLoaded]);  // Add isLoaded as a dependency


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

                    {isLoading && (
                        <Box
                            position="absolute"
                            top={0}
                            bottom={0}
                            left={0}
                            right={0}
                            justifyContent="center"
                            alignItems="center"
                            zIndex={1}
                            bgColor="rgba(0, 0, 0, 0.8)"
                        >
                            <HStack space={2} justifyContent="center">
                                <Spinner accessibilityLabel="Loading posts" />
                                <Heading color="primary.500" fontSize="md">
                                    Aguarde...
                                </Heading>
                            </HStack>
                        </Box>
                    )}


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
                                        <Image width={'64'} height={"64"}
                                               alt="Alternate Text" size="2xl" assetId={album?.image_cover.id}/>
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
                                {album?.content && (
                                    <Box p={4} pb={20}>
                                        <RenderHtml
                                            contentWidth={width}
                                            source={{html: album?.content}}
                                            baseStyle={{color: 'white'}}
                                        />
                                    </Box>
                                )}
                            </ScrollView>
                        </>
                    )}
                    {/* Rest of the AudioPlayer layout */}
                    {!isExpanded && (
                        <TouchableOpacity onPress={toggleExpanded} activeOpacity={1}>
                            <Box>
                                <HStack space={4} alignItems={"center"} pr={4}>
                                    <Box>
                                        <Image width={'16'} height={"16"}
                                               alt="Alternate Text" size="2xl" assetId={album?.image_cover.id}/>
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
