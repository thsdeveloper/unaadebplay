import {ScrollView, useWindowDimensions} from 'react-native';
import PlayerControls from './PlayerControls';
import {RepertoriesTypes} from "@/types/RepertoriesTypes";
import RenderHtml from "react-native-render-html";
import {Box} from "@/components/ui/box";
import {VStack} from "@/components/ui/vstack";
import {Heading} from "@/components/ui/heading";

interface ExpandedViewProps {
    album: RepertoriesTypes | null;
    isPlaying: boolean;
    onPlayPausePress: () => void;
    stopSound: () => void;
    duration: number;
    position: number;
    handlePositionChange: (newPosition: any) => void;
}


const ExpandedView = ({album, isPlaying, position, duration, onPlayPausePress, stopSound, handlePositionChange}: ExpandedViewProps) => {
    const window = useWindowDimensions();
    const contentWidth = window.width;
    return (
        <Box width={'100%'}>
            <VStack space={2} justifyContent="center" alignItems="center">
                <Heading fontSize="2xl">
                    {album?.title}
                </Heading>
                <Heading fontSize="md">
                    {album?.artist} - {album?.category[0]}
                </Heading>
            </VStack>
            <PlayerControls
                isPlaying={isPlaying}
                duration={duration}
                position={position}
                stopSound={stopSound}
                onPlayPausePress={onPlayPausePress}
                onPositionChange={handlePositionChange}
            />
            <ScrollView>
                <Box p={6}>
                    <RenderHtml
                        contentWidth={contentWidth}
                        source={{html: album?.content || ''}}
                        tagsStyles={{
                            p: {color: 'white'},
                            span: {color: 'white'}
                        }}
                    />
                </Box>
            </ScrollView>
        </Box>
    );
};

export default ExpandedView;
