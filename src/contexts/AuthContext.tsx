import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import api, {handleErrors} from "../services/api";
import {UserTypes} from "../types/UserTypes";
import AlertContext from "./AlertContext";

interface Props {
    children: React.ReactNode;
}

interface AuthContextData {
    signed: boolean;
    user: UserTypes | null;
    signIn(email: string, password: string): Promise<void>;
    signOut(): void;
    requestPasswordReset(email: string): Promise<void>;
    setUser(user: UserTypes): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    loading: boolean;
}


const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<Props> = ({ children }) => {
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

    async function signIn(email: string, password: string) {
        try {
            const reponseLogin = await axios.post('https://back-unaadeb.onrender.com/auth/login', {email: email, password: password});
            const { access_token, refresh_token, expires } = reponseLogin.data.data;
            const responseUser = await axios.get('https://back-unaadeb.onrender.com/users/me', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            const user: UserTypes = { ...responseUser.data.data };
            await setAuthStorage(user, access_token, refresh_token, expires);
            await setUser(user);

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

    async function setAuthStorage(user: UserTypes, access_token: string, refresh_token: string, expires: number) {
        await AsyncStorage.setItem('@UNAADEBAuth:user', JSON.stringify(user));
        await AsyncStorage.setItem('@UNAADEBAuth:access_token', access_token);
        await AsyncStorage.setItem('@UNAADEBAuth:refresh_token', refresh_token);
        await AsyncStorage.setItem('@UNAADEBAuth:expires', String(expires));
    }

    async function getRefreshToken() {
        try {
            return await AsyncStorage.getItem("@UNAADEBAuth:refresh_token");
        } catch (error) {
            console.error("Erro ao obter refresh_token:", error);
        }
    }

    async function clearAuthStorage() {
        try {
            await AsyncStorage.multiRemove([
                "@UNAADEBAuth:access_token",
                "@UNAADEBAuth:refresh_token",
                "@UNAADEBAuth:expires",
            ]);
        } catch (error) {
            console.error("Erro ao limpar o armazenamento da autenticação:", error);
        }
    }

    async function signOut() {
        try {
            const refresh_token = await getRefreshToken();

            if (refresh_token) {
                await axios.post(`https://back-unaadeb.onrender.com/auth/logout`, {
                    refresh_token: refresh_token
                });
            }

            await clearAuthStorage();
            await setUser(null);
        } catch (error) {
            handleErrors(error.data.errors)
            console.error("Erro ao sair:", error.data.errors);
        }
    }

    return (
        <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, requestPasswordReset, resetPassword, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;

export function useAuth() {
    return useContext(AuthContext);
}
