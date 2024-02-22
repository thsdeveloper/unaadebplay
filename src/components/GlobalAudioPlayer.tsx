import React from 'react';
import {useAudioPlayer} from "@/contexts/AudioPlayerContext";
import AudioPlayer from "./AudioPlayer";
import {SafeAreaView} from "react-native";

const GlobalAudioPlayer = () => {
    const { albumID, setAlbumID } = useAudioPlayer();

    if (!albumID) {
        return null;
    }

    return (
        <SafeAreaView>
            <AudioPlayer
                albumID={albumID}
                onClose={() => setAlbumID(null)}
            />
        </SafeAreaView>

    );
};

export default GlobalAudioPlayer;
