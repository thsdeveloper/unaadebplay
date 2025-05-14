// hooks/useTheme.ts
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';
type ActiveTheme = 'light' | 'dark';

export const useTheme = () => {
    // O tema padrão do dispositivo
    const deviceTheme = useColorScheme();

    // Preferência do usuário (light, dark ou system)
    const [themePreference, setThemePreference] = useState<ThemeMode>('system');

    // Tema ativo (sempre será light ou dark)
    const [activeTheme, setActiveTheme] = useState<ActiveTheme>(deviceTheme === 'dark' ? 'dark' : 'light');

    // Carrega a preferência do tema ao iniciar
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('user-theme-preference');
                if (savedTheme) {
                    setThemePreference(savedTheme as ThemeMode);

                    // Determina o tema ativo baseado na preferência
                    if (savedTheme === 'system') {
                        setActiveTheme(deviceTheme === 'dark' ? 'dark' : 'light');
                    } else {
                        setActiveTheme(savedTheme as ActiveTheme);
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar preferência de tema:', error);
            }
        };

        loadThemePreference();
    }, [deviceTheme]);

    // Atualiza o tema ativo quando o deviceTheme muda e a preferência é 'system'
    useEffect(() => {
        if (themePreference === 'system') {
            setActiveTheme(deviceTheme === 'dark' ? 'dark' : 'light');
        }
    }, [deviceTheme, themePreference]);

    // Função para alterar o tema
    const setTheme = async (newTheme: ThemeMode) => {
        try {
            await AsyncStorage.setItem('user-theme-preference', newTheme);
            setThemePreference(newTheme);

            if (newTheme === 'system') {
                setActiveTheme(deviceTheme === 'dark' ? 'dark' : 'light');
            } else {
                setActiveTheme(newTheme as ActiveTheme);
            }
        } catch (error) {
            console.error('Erro ao salvar preferência de tema:', error);
        }
    };

    // Função para alternar entre temas light e dark
    const toggleTheme = async () => {
        const newTheme = activeTheme === 'light' ? 'dark' : 'light';
        await setTheme(newTheme);
    };

    return {
        themePreference, // 'light', 'dark' ou 'system'
        activeTheme,     // Sempre 'light' ou 'dark'
        setTheme,        // Função para definir o tema
        toggleTheme,     // Função para alternar entre light e dark
        isSystemTheme: themePreference === 'system'
    };
};

export default useTheme;
