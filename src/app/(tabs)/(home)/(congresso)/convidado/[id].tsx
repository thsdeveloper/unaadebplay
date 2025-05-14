import React, {useState} from "react";
import {useGlobalSearchParams, useNavigation} from "expo-router";
import {CongressType} from "@/types/CongressType";
import {Box} from "@/components/ui/box";

export default function ConvidadoPage() {
    const [congress, setCongress] = useState<CongressType | null>(null);
    const [convidados, setConvidados] = useState<any[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const {id} = useGlobalSearchParams();
    const navigation = useNavigation()


    // useEffect(() => {
    //     const fetchCongresso = async () => {
    //         setLoading(true);
    //         try {
    //             const response = await getItem<CongressType>('congresso', id,{
    //                 fields: ['*', 'convidados.*'],
    //             });
    //             setConvidados(response.convidados)
    //             setCongress(response);
    //         } catch (error) {
    //             console.error(error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchCongresso();
    // }, [id]);

    //
    // const headerBackgroundColor = scrollY.interpolate({
    //     inputRange: [0, 50], // Ajuste conforme necessário
    //     outputRange: ['transparent', '#ff1e00'], // Substitua '#desiredColor' pela cor desejada
    //     extrapolate: 'clamp',
    // });
    //
    //
    // useLayoutEffect(() => {
    //     navigation.setOptions({
    //         headerBackTitle: 'Voltar',
    //         title: `${congress?.name}`,
    //         headerTintColor: colors.white,
    //         headerStyle: {backgroundColor: headerBackgroundColor},
    //         headerBackground: () => (
    //             <BlurView
    //                 style={{flex: 1}}
    //                 intensity={20}
    //                 tint={'light'}
    //             />
    //         ),
    //         headerRight: () => (
    //             <Link href={'/users'} asChild>
    //                 <TouchableOpacity activeOpacity={0.7} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
    //                     <Feather name="share-2" size={24} color={colors.white}/>
    //                 </TouchableOpacity>
    //             </Link>
    //         ),
    //     });
    // }, [headerBackgroundColor]);
    //
    // if (loading) {
    //     return <CongressItemSkeletons/>;
    // }
    //
    // if (!congress) {
    //     return <Text>Não foi possível carregar os dados do congresso.</Text>;
    // }


    return (
        <Box>
            Olá Brasil
        </Box>
    );
};
