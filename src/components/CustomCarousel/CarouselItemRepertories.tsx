import React, {useEffect, useState} from 'react';
import {Dimensions, TouchableOpacity} from 'react-native';
import {getItems} from "@/services/items";
import {RepertoriesTypes} from "@/types/RepertoriesTypes";
import {Image} from "@/components/Image";
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";
import {Box, FlatList, Text} from "native-base";
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

    const CarouselItem = ({repertorie}) => (
       <Box px={2}>
           <TouchableOpacity onPress={() => onItemChange(repertorie)}>
               <Image assetId={repertorie.image_cover.id} width={'150'} height={'150'}/>
           </TouchableOpacity>
       </Box>
    );


    useEffect(() => {
        const loadRepertories = async () => {
            const responseRepertories = await getItems<RepertoriesTypes[]>('repertorios', params);
            setRepertoires(responseRepertories);
        };

        loadRepertories();
    }, [id]);

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
        <FlatList
            horizontal
            data={repertoires}
            renderItem={({item}: RepertoriesTypes) => <CarouselItem repertorie={item} />}
            snapToInterval={windowWidth * 0.8}
            decelerationRate="fast"
            keyExtractor={(repertorie: RepertoriesTypes) => repertorie.id}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
        />
    );
};
