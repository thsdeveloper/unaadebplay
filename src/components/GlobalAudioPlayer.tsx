import React from 'react';
import {useAudioPlayer} from "../contexts/AudioPlayerContext";
import AudioPlayer from "./AudioPlayer";

const GlobalAudioPlayer = () => {
    const { albumID, setAlbumID } = useAudioPlayer();

    if (!albumID) {
        return null;
    }

    return (
        <AudioPlayer
            albumID={albumID}
            onClose={() => setAlbumID(null)}
        />
    );
};

export default GlobalAudioPlayer;
