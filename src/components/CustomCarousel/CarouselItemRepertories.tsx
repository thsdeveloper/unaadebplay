import React, {useEffect, useState} from 'react';
import {Dimensions, TouchableOpacity} from 'react-native';
import CustomCarousel from './CustomCarousel';
import {getItems} from "@/services/items";
import {RepertoriesTypes} from "@/types/RepertoriesTypes";
import {Image} from "@/components/Image";
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";
import {Box, Text} from "native-base";
import colors from "@/constants/colors";
import {useAudioPlayer} from "@/contexts/AudioPlayerContext";

const windowWidth = Dimensions.get('window').width;

interface PropsCarrousseu {
    id: string | string[]
}


export default function CarouselItemRepertories({id}: PropsCarrousseu) {
    const params: GlobalQueryParams = {
        // filter: {congresso: {_eq: id}},
        fields: ['*.*', 'mp3.*'],
    }


    const [repertoires, setRepertoires] = useState<RepertoriesTypes[] | []>([]);
    const {setAlbumID} = useAudioPlayer();

    const onItemChange = (item) => {
        alert(item.mp3.id)
        setAlbumID(item.mp3);
    }

    const CarouselItem = ({item}) => (
        <TouchableOpacity onPress={() => onItemChange(item)}>
            <Image assetId={item.image_cover.id} width={'150'} height={'150'}/>
        </TouchableOpacity>
    );


    useEffect(() => {
        const loadRepertories = async () => {
            const responseRepertories = await getItems<RepertoriesTypes>('repertorios', params);
            setRepertoires(responseRepertories);
        };

        loadRepertories();
    }, []);

    if (repertoires.length === 0) {
        return (
            <>
                <Box py={4} px={2}>
                    <Text color={colors.light}>Nenhum repertório cadastrado no momento</Text>
                </Box>
            </>
        )
    }

    return (
        <CustomCarousel
            data={repertoires}
            renderItem={({item}) => <CarouselItem item={item}/>}
            sliderWidth={windowWidth}
            itemWidth={150} // Tamanho uniforme dos itens
            inactiveSlideScale={1}
            inactiveSlideOpacity={0.5}
            snapToAlignment={'start'}
            snapToInterval={150 + 10} // Inclui o espaçamento entre os itens
            contentContainerCustomStyle={{
                paddingLeft: 10, // Alinha o primeiro item à esquerda
                paddingRight: windowWidth - 150 // Garante o efeito de borda infinita
            }}
            slideStyle={{marginRight: 10}} // Espaçamento entre os itens
        />
    );
};
