import React, {useState, useEffect, useContext} from 'react';
import {ImageBackground, TouchableOpacity} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import ConfigContext from '../../contexts/ConfigContext';
import AlertContext from '../../contexts/AlertContext';
import {getItem} from '@/services/items';
import {RepertoriesTypes} from '@/types/RepertoriesTypes';
import {useAudioPlayer} from '@/hooks/useAudioPlayer';
import CollapsedView from "@/components/AudioPlayer/CollapsedView";
import {getAssetURI} from "@/services/files";
import {Actionsheet, Box, Button, Icon, Text, useDisclose} from "native-base";
import {useRepertorieContext} from "@/contexts/AudioPlayerContext";
import ExpandedView from "@/components/AudioPlayer/ExpandedView";
import {Image} from "@/components/Image";

const AudioPlayer = () => {
    const {repertorieID, setRepertorieID} = useRepertorieContext();
    const [album, setAlbum] = useState<RepertoriesTypes | null>(null);
    const [audioURI, setAudioURI] = useState<string | null>(null);
    const config = useContext(ConfigContext);
    const alert = useContext(AlertContext);

    useEffect(() => {
        if (repertorieID) {
            const loadAlbum = async () => {
                try {
                    const params = {fields: '*.*,mp3.*'};

                    const albumResponse = await getItem<RepertoriesTypes>('repertorios', repertorieID, params);
                    setAlbum(albumResponse);

                    const audioFile = await getAssetURI(albumResponse.mp3.id);
                    const newAudioURI = `${config.url_api}/assets/${audioFile.id}`;

                    setAudioURI(newAudioURI);

                    alert.success(`Música carregada com sucesso`);
                } catch (e) {
                    alert.error(`Erro ao buscar e definir um audio: ${e}`)
                }
            };

            loadAlbum();
        }


    }, [repertorieID]);


    const {playPauseSound, stopSound, isPlaying, position, duration, seek} = useAudioPlayer(audioURI);

    const {isOpen, onOpen, onClose} = useDisclose();

    // Função que será chamada quando o slider mudar
    const handlePositionChange = async (newPosition) => {
       await seek(newPosition * 1000); // A função seek espera um valor em milissegundos
    };

    return (
        <>
            {repertorieID && (
                <>
                    <TouchableOpacity onPress={() => onOpen()} activeOpacity={0.9}>
                        <CollapsedView album={album} duration={duration} isPlaying={isPlaying}
                                       onPlayPausePress={playPauseSound}/>
                    </TouchableOpacity>

                    <Actionsheet isOpen={isOpen} onClose={onClose}>
                        <Actionsheet.Content padding={0}>
                            <ExpandedView
                                album={album}
                                isPlaying={isPlaying}
                                position={position}
                                duration={duration}
                                onPlayPausePress={playPauseSound}
                                handlePositionChange={handlePositionChange}
                                stopSound={async () =>  {
                                    await stopSound()
                                    setRepertorieID(null)
                                    onClose()
                                }}
                            />
                        </Actionsheet.Content>
                    </Actionsheet>
                </>
            )}
        </>
    );
};

export default AudioPlayer;
