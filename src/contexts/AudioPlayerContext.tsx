import React, {createContext, useState, useContext, ReactNode} from 'react';

interface AudioPlayerContextData {
    albumID: string | null;
    setAlbumID: (string: string | null) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextData>({
    albumID: null,
    setAlbumID: () => {},
});

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext);
    if (!context) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
    }
    return context;
};

interface AudioPlayerProviderProps {
    children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
    const [albumID, setAlbumID] = useState<string | null>(null);

    return (
        <AudioPlayerContext.Provider value={{albumID, setAlbumID}}>
            {children}
        </AudioPlayerContext.Provider>
    );
};
