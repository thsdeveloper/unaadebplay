import React, {useContext} from 'react';
import {Box, HStack, Text, VStack, IconButton} from 'native-base';
import {MaterialIcons} from '@expo/vector-icons';
import {ImageBackground} from "react-native";
import ConfigContext from "@/contexts/ConfigContext";
import {LinearGradient} from "expo-linear-gradient";
import {RepertoriesTypes} from "@/types/RepertoriesTypes";
import {Image} from "@/components/Image";

interface CollapsedViewProps {
    album: RepertoriesTypes | null;
    isPlaying: boolean;
    onPlayPausePress: () => void;
    duration: number;
}

const CollapsedView = ({album, isPlaying, onPlayPausePress, duration}: CollapsedViewProps) => {
    const config = useContext(ConfigContext);

    return (
        <Box position={'absolute'} width={'100%'} top={-80} height={20} padding={2}>

            <Box>
                <ImageBackground source={{uri: `${config.url_api}/assets/${album?.image_cover.filename_disk}`}}>

                    <LinearGradient colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.5)']}>

                        <HStack space={2} alignItems="center" justifyContent="space-between">
                            <Box>
                                <Image width={16} height={16} assetId={album?.image_cover.id} />
                            </Box>
                            <Box>
                                <Text color="white" bold>
                                    {album?.title} - {duration}
                                </Text>
                                <Text color="white">{album?.artist}</Text>
                            </Box>
                            <Box>
                                <IconButton
                                    icon={<MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={24} color="white"/>}
                                    onPress={onPlayPausePress}
                                    borderRadius="full"
                                />
                            </Box>
                        </HStack>


                    </LinearGradient>
                </ImageBackground>
            </Box>

        </Box>
    );
};

export default CollapsedView;
