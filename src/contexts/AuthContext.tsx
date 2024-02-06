import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import api, {handleErrors, signIn, signOut} from "../services/api";
import {UserTypes} from "../types/UserTypes";
import AlertContext from "./AlertContext";

interface Props {
    children: React.ReactNode;
}

interface AuthContextData {
    signed: boolean;
    user: UserTypes | null;

    login(email: string, password: string): Promise<void>;

    logout(): void;

    requestPasswordReset(email: string): Promise<void>;

    setUser(user: UserTypes): Promise<void>;

    resetPassword(token: string, newPassword: string): Promise<void>;

    loading: boolean;
}


const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<Props> = ({children}) => {
    const [user, setUserState] = useState<UserTypes | null>(null);
    const [loading, setLoading] = useState(false);
    const alert = useContext(AlertContext)

    useEffect(() => {
        async function loadStorageData() {
            setLoading(true);

            const keys = ['@UNAADEBAuth:user', '@UNAADEBAuth:access_token', '@UNAADEBAuth:refresh_token'];
            const [[, user], [, access_token], [, refresh_token]] = await AsyncStorage.multiGet(keys);

            if (user && access_token) {
                setUserState(JSON.parse(user));
            }

            setLoading(false);
        }

        loadStorageData();
    }, []);


    async function setUser(user: UserTypes) {
        await AsyncStorage.setItem('@UNAADEBAuth:user', JSON.stringify(user));
        setUserState(user);
    }

    async function login(email: string, password: string) {
        try {
            const user = await signIn(email, password)
            // Verifica se o status do usuário é "active"
            if (user.status === 'active') {
                await setAuthStorage(user);
                await setUser(user);
            } else {
                // Caso contrário, exibe uma mensagem de erro informando que o usuário não está ativo
                alert.error('Usuário nao esta ativo!')
                throw new Error('Usuário não está ativo.');
            }

        } catch (error) {
            const message = handleErrors(error.response.data.errors);
            alert.error(message)
        }

    }

    async function requestPasswordReset(email: string): Promise<void> {
        try {
            await api.post('/auth/password/request', {
                email: email,
                reset_url: "https://unaadeb.app.br/reset-password"
            });
        } catch (error) {
            throw error;
        }
    }

    async function resetPassword(token: string, newPassword: string): Promise<void> {
        try {
            await api.post('/auth/password/reset', {
                token: token,
                password: newPassword,
            });
        } catch (error) {
            throw error;
        }
    }

    async function setAuthStorage(user: UserTypes) {
        await AsyncStorage.setItem('@UNAADEBAuth:user', JSON.stringify(user));
    }

    async function logout() {
        try {
            const result = await signOut();
            await setUser(null);
        } catch (error) {
            handleErrors(error.data.errors)
            console.error("Erro ao sair:", error.data.errors);
        }
    }

    return (
        <AuthContext.Provider
            value={{signed: !!user, user, login, logout, requestPasswordReset, resetPassword, setUser, loading}}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;

export function useAuth() {
    return useContext(AuthContext);
}
