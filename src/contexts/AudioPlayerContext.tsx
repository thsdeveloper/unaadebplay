import React, { createContext, useState, useContext } from 'react';
import {FilesTypes} from "../types/FilesTypes";
import {RepertoriesTypes} from "../types/RepertoriesTypes";

interface AudioPlayerContextData {
    audioURI: string | null;
    setAudioURI: (uri: string | null) => void;
    setAlbum: (album: RepertoriesTypes | null) => void;
    album: RepertoriesTypes | null;
}

const AudioPlayerContext = createContext<AudioPlayerContextData>({
    audioURI: null,
    setAudioURI: () => {},
    album: null,
    setAlbum: () => {},
});

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};

export const AudioPlayerProvider: React.FC = ({ children }) => {
    const [audioURI, setAudioURI] = useState<string | null>(null);
    const [album, setAlbum] = useState<FilesTypes | null>(null);

    return (
        <AudioPlayerContext.Provider value={{ audioURI, setAudioURI, album, setAlbum }}>
            {children}
        </AudioPlayerContext.Provider>
    );
};
