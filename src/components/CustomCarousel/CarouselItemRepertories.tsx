import React, {useEffect, useState} from 'react';
import {Dimensions, FlatList, TouchableOpacity} from 'react-native';
import {getItems} from "@/services/items";
import {RepertoriesTypes} from "@/types/RepertoriesTypes";
import {Image} from "@/components/Image";
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";
import colors from "@/constants/colors";
import {useRepertorieContext} from "@/contexts/AudioPlayerContext";
import {Box} from "@/components/ui/box";

const windowWidth = Dimensions.get('window').width;

interface CarouselItemProps {
    repertorie: RepertoriesTypes;
}

interface CarouselItemRepertoriesProps{
    idCongresso: string
}

export default function CarouselItemRepertories({idCongresso}: CarouselItemRepertoriesProps) {
    const [repertoires, setRepertoires] = useState<RepertoriesTypes[]>([]);
    const {setRepertorieID} = useRepertorieContext();

    //Busca os repertórios cadastrados
    useEffect(() => {
        const loadRepertories = async () => {
            const params: GlobalQueryParams = {
                fields: ['*.*', 'mp3.*'],
                filter: {
                    status: {
                        _eq: 'published',
                    },
                    congresso: {
                        _eq: idCongresso, // Substitua 'valorDoCongressoX' pelo ID correto do congresso X
                    },
                },
            }
            const responseRepertories = await getItems<RepertoriesTypes[]>('repertorios', params);
            setRepertoires(responseRepertories);
        };
        loadRepertories();
    }, []);

    const CarouselItem: React.FC<CarouselItemProps> = ({ repertorie }) => (
       <Box px={2}>
           <TouchableOpacity onPress={() => setRepertorieID(repertorie.id)}>
               <Image assetId={repertorie.image_cover.id} width={40} height={40}/>
           </TouchableOpacity>
       </Box>
    );


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
            renderItem={({ item }) => <CarouselItem repertorie={item} />}
            snapToInterval={windowWidth * 0.8}
            decelerationRate="fast"
            keyExtractor={(repertorie: RepertoriesTypes) => repertorie.id}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
        />
    );
};
