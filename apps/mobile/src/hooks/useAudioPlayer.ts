import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import AlertContext from "@/contexts/AlertContext";

export const useAudioPlayer = (audioURI: string | null) => {
    // expo-audio é imperativo: criamos/destruímos o player por URI via ref
    const playerRef = useRef<AudioPlayer | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    // position/duration expostos em MILISSEGUNDOS para preservar o contrato dos consumidores
    const [position, setPosition] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const alert = useContext(AlertContext);

    // Configura a sessão de áudio (uma vez).
    // Garante reprodução mesmo no modo silencioso (iOS) e em background.
    useEffect(() => {
        setAudioModeAsync({
            allowsRecording: false,
            playsInSilentMode: true,
            interruptionMode: 'duckOthers',
            shouldRouteThroughEarpiece: false,
            shouldPlayInBackground: true,
        }).catch((e) => {
            console.error('Failed to set audio session category: ', e);
        });
    }, []);

    // Cria (ou recria) o player quando o audioURI muda
    useEffect(() => {
        if (!audioURI) return;

        let player: AudioPlayer;
        try {
            player = createAudioPlayer({ uri: audioURI });
            playerRef.current = player;
            player.play();
            setIsPlaying(true);
        } catch (error) {
            alert.error(`Error loading audio: ${error}`);
            return;
        }

        // expo-audio reporta tempos em SEGUNDOS — convertemos para ms na fronteira do hook
        const subscription = player.addListener('playbackStatusUpdate', (status) => {
            setPosition(status.currentTime * 1000);
            if (status.duration > 0) {
                setDuration(status.duration * 1000);
            }
            setIsPlaying(status.playing);
        });

        return () => {
            subscription.remove();
            player.remove();
            playerRef.current = null;
        };
    }, [audioURI]);

    // Toca ou pausa o som
    const playPauseSound = useCallback(async () => {
        const player = playerRef.current;
        if (!player) return;

        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
    }, []);

    // Para o som (pausa e volta ao início). Mantém o player carregado para permitir retomar.
    const stopSound = useCallback(async () => {
        try {
            const player = playerRef.current;
            if (!player) return;
            player.pause();
            await player.seekTo(0);
            setIsPlaying(false);
            setPosition(0);
        } catch (error) {
            alert.error('Não foi possível parar o áudio');
        }
    }, []);

    // Busca uma nova posição. Recebe MILISSEGUNDOS (contrato público) e converte para segundos.
    const seek = async (positionMillis: number) => {
        const player = playerRef.current;
        if (player) {
            await player.seekTo(positionMillis / 1000);
        }
    };

    return { playPauseSound, stopSound, isPlaying, position, duration, seek };
};
