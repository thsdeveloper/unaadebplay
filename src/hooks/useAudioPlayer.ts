import { useState, useEffect, useCallback, useContext } from 'react';
import { Audio } from 'expo-av';
import AlertContext from "@/contexts/AlertContext";
import { Sound } from "expo-av/build/Audio/Sound";

interface UseAudioPlayerProps {
    audioURI: string | null;
}

export const useAudioPlayer = (audioURI : UseAudioPlayerProps) => {
    const [sound, setSound] = useState<Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [position, setPosition] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const alert = useContext(AlertContext);

    useEffect(() => {
        const configureAudioSession = async () => {
            try {
                // Configura a sessão de áudio para reprodução de mídia
                // Isso garante que o áudio seja reproduzido mesmo que o switch de silencioso esteja ativado
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true, // Importante para tocar áudio mesmo no modo silencioso
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                    staysActiveInBackground: true,
                });
            } catch (e) {
                console.error('Failed to set audio session category: ', e);
            }
        };
        configureAudioSession();
    }, []);

    // Carrega o áudio quando o audioURI muda
    useEffect(() => {
        let isMounted = true;  // Flag para verificar se o componente está montado

        const loadSound = async () => {
            if (!audioURI) return;

            // Tenta descarregar o som atual antes de carregar um novo
            if (sound) {
                await sound.unloadAsync();
            }

            try {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioURI },
                    { shouldPlay: true, staysActiveInBackground: true }  // Inicialmente não deve tocar
                );

                if (isMounted) {
                    setSound(newSound);
                    setIsPlaying(true);  // Não toca automaticamente

                    newSound.setOnPlaybackStatusUpdate((status) => {
                        setPosition(status.positionMillis);
                        setDuration(status.durationMillis);
                        setIsPlaying(status.isPlaying);
                    });
                }
            } catch (error) {
                alert.error(`Error loading audio: ${error}`);
            }
        };

        loadSound();

        return () => {
            isMounted = false;  // Define que o componente não está mais montado
            sound?.unloadAsync();
        };
    }, [audioURI]);

    // Toca ou pausa o som
    const playPauseSound = useCallback(async () => {
        if (!sound) return;

        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            await sound.playAsync();
        }
    }, [sound, isPlaying]);

    // Para o som e descarrega o áudio
    const stopSound = useCallback(async () => {
        try {
            if (!sound) return;
            await sound.stopAsync();  // Usa stopAsync para garantir que o áudio pare
            await sound.unloadAsync();
            setIsPlaying(false);
            setPosition(0);
            setSound(null);
        } catch (error) {
            alert.error('Não foi possível parar o áudio');
        }
    }, [sound]);

    // Função para buscar uma nova posição no áudio
    const seek = async (position) => {
        if (sound) {
            await sound.setPositionAsync(position);
        }
    };

    return { playPauseSound, stopSound, isPlaying, position, duration, seek };
};
