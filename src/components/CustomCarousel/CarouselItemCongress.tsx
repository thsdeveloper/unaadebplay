import {Dimensions, StyleSheet} from 'react-native';
import {Link} from "expo-router";
import { useThemedColors } from "@/hooks/useThemedColors";
import {Feather} from "@expo/vector-icons";
import {Box} from "@/components/ui/box";
import {Button} from "@/components/ui/button";

const windowWidth = Dimensions.get('window').width;

interface PropsButtonsCongress{
    title: string,
    router: string,
    icon: string
}

const CarouselItem = ({title, icon, router}: PropsButtonsCongress) => (
    <Box py={2} my={2} mx={1}>
        <Link href={router} asChild>
            <Button colorScheme={'light'} leftIcon={
                <Feather name={icon} size={16} color={colors.light} />
            }  color={colors.light} rounded={'full'} shadow={2}>{title}</Button>
        </Link>
    </Box>
);


export default function CarouselItemCongress() {
    const colors = useThemedColors();

    const congressButtons: any[] = [
        {
            title: 'Localização',
            router: '/localizacao',
            icon: 'map-pin'
        },
        {
            title: 'Informações',
            router: '/informacoes',
            icon: 'info'
        },
        {
            title: 'Contribua',
            router: '/contribua',
            icon: 'dollar-sign'
        },
        {
            title: 'Patrocinadores',
            router: '/patrocinadores',
            icon: 'award'
        },
        {
            title: 'Programação',
            router: '/programacao',
            icon: 'check-square'
        },
        {
            title: 'Camisetas',
            router: '/camisetas',
            icon: 'tag'
        },
        {
            title: 'Repertórios',
            router: '/repertories',
            icon: 'music'
        }
    ]


    return (
        <Box>
            <FlatList
                horizontal
                data={congressButtons}
                renderItem={({item}: any) => <CarouselItem {...item} />}
                snapToInterval={windowWidth * 0.8}
                decelerationRate="fast"
                keyExtractor={(user: PropsButtonsCongress) => user.title}
                contentContainerStyle={styles.flatListContainer}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
            />
        </Box>
    );
};

const styles = StyleSheet.create({
    flatListContainer: {
        flexGrow: 1,
    },
    textBackground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '90%',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    bannerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bannerDescription: {
        color: 'white',
        fontSize: 14,
    },
    dots: {
        alignSelf: 'center',
        marginTop: 8,
    },
});

