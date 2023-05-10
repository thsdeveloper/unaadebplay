import React, {useState, useEffect, useContext} from 'react';
import {FlatList, TouchableOpacity} from 'react-native';
import {Box, Text, VStack, HStack, Divider, Spinner, Stack} from 'native-base';
import {getItems} from '../../../services/items';
import {RepertoriesTypes} from '../../../types/RepertoriesTypes';
import {getAssetURI} from "../../../services/AssetsService";
import {Image} from "../../../components/Image";
import TranslationContext from "../../../contexts/TranslationContext";
import { FontAwesome } from '@expo/vector-icons';
import colors from "../../../constants/colors";
import {useAudioPlayer} from "../../../contexts/AudioPlayerContext";
import GlobalAudioPlayer from "../../../components/GlobalAudioPlayer";

const RepertoireListScreen = () => {
    const [repertoires, setRepertoires] = useState<RepertoriesTypes>();
    const [isLoading, setIsLoading] = useState(false);
    const {t} = useContext(TranslationContext);
    const { setAudioURI, setAlbum } = useAudioPlayer();

    useEffect(() => {
        const loadRepertories = async () => {
            const response = await getItems<RepertoriesTypes>('repertorios', {
                fields: '*.*,mp3.*',
            });
            setRepertoires(response);
        };

        loadRepertories();
    }, []);

    const handleAudioPress = async (album: RepertoriesTypes) => {
        setIsLoading(true);
        const uri = await getAssetURI(album.mp3.id);
        setAudioURI(uri);
        setAlbum(album);
        setIsLoading(false);
    };

    const renderItem = ({item}: { item: RepertoriesTypes }) => (
        <TouchableOpacity onPress={() => handleAudioPress(item)}>
            <Stack direction="row" space={"sm"} p={2}>
                <Box>
                    <Image width={20} height={20} assetId={item.image_cover.id}/>
                </Box>
                <Box>
                    <VStack>
                        <Text fontSize="lg" fontWeight="bold">
                            {item.title}
                        </Text>
                        <Text color="gray.500">{item.artist}</Text>
                        <Text color="gray.500" fontWeight={"bold"}>{item.category[0]}</Text>
                    </VStack>
                </Box>
            </Stack>
            <Divider/>
        </TouchableOpacity>
    );

    return (
        <Box flex={1} bg="white">
            <Stack space={"sm"} p={2} direction={"row"} alignItems={"center"}>
                <FontAwesome
                    name={'music'}
                    size={20}
                    color={colors.secundary}
                />
                <Text color={colors.secundary} fontSize={"lg"} fontWeight={"bold"}>{t('text_repertoire')}</Text>
            </Stack>

            <FlatList
                data={repertoires}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
            {isLoading && (
                <Box
                    position="absolute"
                    top={0}
                    bottom={0}
                    left={0}
                    right={0}
                    justifyContent="center"
                    alignItems="center"
                    zIndex={1}
                    bgColor="rgba(0, 0, 0, 0.8)"
                >
                    <Spinner accessibilityLabel="Loading posts" color="white"/>
                </Box>
            )}
            <GlobalAudioPlayer />
        </Box>
    );
};

export default RepertoireListScreen;
