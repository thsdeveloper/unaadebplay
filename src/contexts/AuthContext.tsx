import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {signOut, signIn, requestPassword, requestResetPassword} from "../services/auth";
import {UserTypes} from "../types/UserTypes";
import AlertContext from "./AlertContext";
import {handleErrors} from "../utils/directus";

interface Props {
    children: React.ReactNode;
}

interface AuthContextData {
    signed: boolean;
    user: UserTypes | null;

    login(email: string | null, password: string | null): Promise<void>;

    logout(): void;

    requestPasswordReset(email: string): Promise<void>;

    setUser(user: UserTypes | null): Promise<void>;

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
            const keys = ['@UNAADEB:User'];
            const [[, user]] = await AsyncStorage.multiGet(keys);
            if (user) {
                setUserState(JSON.parse(user));
            }
            setLoading(false);
        }

        loadStorageData();
    }, []);

    async function login(email: string, password: string) {
        try {
            const user = await signIn(email, password)
            if (user.status === 'active') {
                await setUser(user);
            }
        } catch (error) {
            const message = handleErrors(error.errors);
            alert.error(message)
        }
    }

    async function logout() {
        try {
            await setUser(null);
            await signOut();
        } catch (error) {
            const message = handleErrors(error.errors);
            alert.error(message)
        }
    }

    async function requestPasswordReset(email: string): Promise<void> {
        try {
            await requestPassword(email);
            alert.success(`Solicitação de redefinição de senha enviada para ${email}`)
        } catch (error) {
            const message = handleErrors(error.errors);
            alert.error(message)
        }
    }

    async function resetPassword(token: string, newPassword: string): Promise<void> {
        try {
            await requestResetPassword(token, newPassword);
        } catch (error) {
            const message = handleErrors(error.errors);
            alert.error(message)
        }
    }

    async function setUser(user: UserTypes | null) {
        await AsyncStorage.setItem('@UNAADEB:User', JSON.stringify(user));
        setUserState(user);
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
