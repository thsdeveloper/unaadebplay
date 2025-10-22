import React from 'react';
import {FontAwesome5, MaterialIcons} from '@expo/vector-icons';
import { useThemedColors } from "@/hooks/useThemedColors";
import {Box} from "@/components/ui/box";
import {HStack} from "@/components/ui/hstack";
import {Slider} from "react-native";

const PlayerControls = ({isPlaying, duration, position, onPlayPausePress, stopSound, onPositionChange }) => {
    const colors = useThemedColors();

    const formattedDuration = Math.round(duration / 1000);
    const formattedPosition = Math.round(position / 1000);

    const timeLeft = formattedDuration - formattedPosition;

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;

        return `${minutes} minuto${minutes !== 1 ? 's' : ''} e ${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    };

    return (
        <Box>
            <HStack alignItems="center" justifyContent={"center"} space={2}>
                           <Box>
                    <IconButton icon={<MaterialIcons name="stop" size={30} color={colors.dark} />} rounded={'full'}
                                onPress={stopSound}/>
                </Box>
                <Box>
                    <IconButton
                        icon={<MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={30} color={colors.dark}/>}
                        onPress={onPlayPausePress}
                        borderRadius="full"
                    />
                </Box>
            </HStack>

            <HStack justifyContent={"center"}>
                <Text color={colors.dark}>{formatTime(timeLeft)}</Text>
            </HStack>

            <Slider
                colorScheme={'dark'}
                w="full"
                minValue={0}
                maxValue={formattedDuration}
                value={formattedPosition}
                onChange={onPositionChange}
                step={0.1}
            >
                <Slider.Track>
                    <Slider.FilledTrack/>
                </Slider.Track>
                <Slider.Thumb/>
            </Slider>
        </Box>
    );
};

export default PlayerControls;
