import React, {createContext, useState, useContext, ReactNode} from 'react';

interface AudioPlayerContextData {
    repertorieID: string | null;
    setRepertorieID: (string: string | null) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextData>({
    repertorieID: null,
    setRepertorieID: () => {},
});

export const useRepertorieContext = () => {
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
    const [repertorieID, setRepertorieID] = useState<string | null>(null);

    return (
        <AudioPlayerContext.Provider value={{repertorieID, setRepertorieID}}>
            {children}
        </AudioPlayerContext.Provider>
    );
};
