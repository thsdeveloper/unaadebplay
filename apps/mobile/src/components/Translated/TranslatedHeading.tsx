import React, { useContext, useEffect, useRef } from 'react';
import { Text, TextProps } from '@/components/ui/text';
import TranslationContext from '@/contexts/TranslationContext';
import { Animated } from 'react-native';

interface TranslatedHeadingProps extends TextProps {
    translationKey: string;
    params?: Record<string, string>;
    animateUpdates?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    bold?: 'normal' | 'semibold' | 'bold' | 'extrabold';
    color?: string;
}

/**
 * Um componente para exibir títulos traduzidos com estilos consistentes.
 * Suporta animação quando o texto é atualizado em tempo real.
 */
const TranslatedHeading: React.FC<TranslatedHeadingProps> = ({
                                                                 translationKey,
                                                                 params,
                                                                 animateUpdates = false,
                                                                 className = '',
                                                                 size = '2xl',
                                                                 bold = 'extrabold',
                                                                 color = 'white',
                                                                 ...props
                                                             }) => {
    const { t } = useContext(TranslationContext);
    const prevText = useRef<string>('');
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Obtém o texto traduzido
    const translatedText = t(translationKey, params);

    // Determina o estilo de acordo com os props
    const getBaseClassName = () => {
        let baseClass = '';

        // Tamanho do texto
        switch (size) {
            case 'sm': baseClass += 'text-sm '; break;
            case 'md': baseClass += 'text-lg '; break;
            case 'lg': baseClass += 'text-xl '; break;
            case 'xl': baseClass += 'text-2xl '; break;
            case '2xl': baseClass += 'text-3xl '; break;
            default: baseClass += 'text-2xl ';
        }

        // Peso da fonte
        switch (bold) {
            case 'normal': baseClass += 'font-normal '; break;
            case 'semibold': baseClass += 'font-semibold '; break;
            case 'bold': baseClass += 'font-bold '; break;
            case 'extrabold': baseClass += 'font-extrabold '; break;
            default: baseClass += 'font-bold ';
        }

        // Cor do texto
        baseClass += `text-${color} `;

        // Padding padrão
        baseClass += 'py-4 ';

        return baseClass;
    };

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

    // Combina os estilos base com os personalizados
    const combinedClassName = `${getBaseClassName()} ${className}`.trim();

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <Text className={combinedClassName} {...props}>
                {translatedText}
            </Text>
        </Animated.View>
    );
};

export default TranslatedHeading;
