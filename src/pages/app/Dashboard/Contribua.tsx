import React, {useContext, useEffect, useRef, useState} from 'react';
import {Box, VStack, Text, HStack, Divider, Button, ScrollView} from 'native-base';
import colors from "../../../constants/colors";
import LottieView from "lottie-react-native";
import * as Clipboard from 'expo-clipboard';
import AlertContext from "../../../contexts/AlertContext";
import QRCode from 'react-native-qrcode-svg';

const Contribua = ({route}: any) => {
    const animation = useRef(null);
    const [showQRCode, setShowQRCode] = useState(false);
    const alert = useContext(AlertContext)

    const pixKey = 'pix@unaadeb.com.br';  // your Pix key
    const pixPayload = `00020101021226850014br.gov.bcb.pix0136${pixKey}52040000530398654040.005802BR5908UNAADEB6009Brasilia62070503***6304D3F2`;

    const handleCopyKey = async () => {
        await Clipboard.setStringAsync(pixKey);
        alert.success('Chave PIX copiada com sucesso!')
    }

    useEffect(() => {

    }, []);

    return (
        <ScrollView backgroundColor={colors.secundary3} flex={1} px={6}>
            <Box alignItems="center" justifyContent="center">
                <LottieView
                    autoPlay
                    ref={animation}
                    style={{
                        width: '100%',
                        height: 200,
                        aspectRatio: 1,
                    }}
                    source={require('../../../assets/99977-money-pf.json')}
                />
            </Box>
            <VStack space={4} justifyItems={"center"} alignItems={"center"}>

                <Text fontSize={28}
                      color={colors.text2}
                      fontWeight={"extrabold"}
                      lineHeight={32}
                      textAlign={"center"}>
                    Contribua para a Realização do Congresso da UNAADEB 2023
                </Text>

                <Divider/>

                <Text fontSize={14} color={colors.text2} textAlign={"center"}>
                    Ajude-nos a fazer do Congresso da UNAADEB um sucesso. Use o Pix para fazer sua contribuição de forma
                    prática e segura. Com a sua ajuda, podemos alcançar nosso objetivo de tornar este congresso um
                    evento memorável e impactante.
                </Text>

                <Text fontSize={18} fontWeight={"bold"} color={colors.text2} textAlign={"center"}>
                    PIX: pix@unaadeb.com.br
                </Text>

                <HStack space={2} alignItems={"center"}>
                    <Button size={"lg"} onPress={handleCopyKey}>
                        Copiar chave PIX
                    </Button>
                </HStack>

                {showQRCode && (
                   <Box pb={20}>
                       <QRCode
                           value={pixPayload}
                           size={200}
                       />
                   </Box>
                )}

            </VStack>

        </ScrollView>
    );
};

export default Contribua;
