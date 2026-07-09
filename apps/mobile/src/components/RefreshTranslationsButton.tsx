// Componente de exemplo para botão de atualização de traduções
// src/components/ui/RefreshTranslationsButton.tsx

import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useContext } from 'react';
import TranslationContext from '@/contexts/TranslationContext';
import { FontAwesome5 } from '@expo/vector-icons';

interface RefreshTranslationsButtonProps {
    style?: any;
    iconOnly?: boolean;
    showLastUpdated?: boolean;
}

const RefreshTranslationsButton: React.FC<RefreshTranslationsButtonProps> = ({
                                                                                 style,
                                                                                 iconOnly = false,
                                                                                 showLastUpdated = true
                                                                             }) => {
    const { refreshTranslations, isLoading, lastUpdated, t } = useContext(TranslationContext);
    const [refreshing, setRefreshing] = useState(false);

    // Formatar a data da última atualização
    const formatLastUpdated = () => {
        if (!lastUpdated) return t('never_updated');

        // Se for hoje
        const today = new Date();
        const isToday = lastUpdated.getDate() === today.getDate() &&
            lastUpdated.getMonth() === today.getMonth() &&
            lastUpdated.getFullYear() === today.getFullYear();

        if (isToday) {
            return `${t('today')} ${lastUpdated.toLocaleTimeString()}`;
        }

        // Se for menos de 7 dias atrás
        const dayDiff = Math.floor((today.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff < 7) {
            return `${dayDiff} ${dayDiff === 1 ? t('day_ago') : t('days_ago')}`;
        }

        // Caso contrário, mostrar data completa
        return lastUpdated.toLocaleDateString();
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshTranslations();
        } finally {
            setRefreshing(false);
        }
    };

    // Se estamos apenas atualizando as traduções no início, não mostrar nada
    if (isLoading && !refreshing) return null;

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={handleRefresh}
            disabled={refreshing}
        >
            {refreshing ? (
                <ActivityIndicator size="small" color="#fff" style={styles.icon} />
            ) : (
                <FontAwesome5
                    name="sync-alt"
                    size={iconOnly ? 20 : 16}
                    color="#fff"
                    style={styles.icon}
                />
            )}

            {!iconOnly && (
                <Text style={styles.text}>{t('refresh_translations')}</Text>
            )}

            {showLastUpdated && lastUpdated && !iconOnly && (
                <Text style={styles.lastUpdated}>
                    {t('last_updated')}: {formatLastUpdated()}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#3498db',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        marginRight: 8
    },
    text: {
        color: '#fff',
        fontWeight: '600'
    },
    lastUpdated: {
        color: '#e0e0e0',
        fontSize: 12,
        marginTop: 4
    }
});

export default RefreshTranslationsButton;
