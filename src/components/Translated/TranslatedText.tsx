import React, { useContext, useEffect, useRef } from 'react';
import { Text, TextProps } from '@/components/ui/text';
import TranslationContext from '@/contexts/TranslationContext';
import { Animated } from 'react-native';

interface TranslatedTextProps extends TextProps {
    translationKey: string;
    params?: Record<string, string>;
    animateUpdates?: boolean;
    className?: string;
}

/**
 * Um componente para exibir textos traduzidos.
 * Pode ser usado para qualquer texto no app que precise de tradução.
 */
const TranslatedText: React.FC<TranslatedTextProps> = ({
                                                           translationKey,
                                                           params,
                                                           animateUpdates = false,
                                                           className = '',
                                                           ...props
                                                       }) => {
    const { t } = useContext(TranslationContext);
    const prevText = useRef<string>('');
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Obtém o texto traduzido
    const translatedText = t(translationKey, params);

    // Anima o texto quando ele muda
    useEffect(() => {
        if (animateUpdates && prevText.current && prevText.current !== translatedText) {
            // Animação de fade out/in quando o texto muda
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0.5,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                })
            ]).start();
        }

        // Atualiza a referência para a próxima comparação
        prevText.current = translatedText;
    }, [translatedText, animateUpdates, fadeAnim]);

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <Text className={className} {...props}>
                {translatedText}
            </Text>
        </Animated.View>
    );
};

export default TranslatedText;
