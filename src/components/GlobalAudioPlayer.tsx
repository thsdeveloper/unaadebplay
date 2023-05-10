import React from 'react';
import {useAudioPlayer} from "../contexts/AudioPlayerContext";
import AudioPlayer from "./AudioPlayer";

const GlobalAudioPlayer = () => {
    const { audioURI, setAudioURI } = useAudioPlayer();

    if (!audioURI) {
        return null;
    }

    return (
        <AudioPlayer
            audioURI={audioURI}
            onClose={() => setAudioURI(null)}
        />
    );
};

export default GlobalAudioPlayer;
