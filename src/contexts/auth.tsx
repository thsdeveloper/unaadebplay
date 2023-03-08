import React, {createContext, useState, useEffect, useContext} from 'react'
import * as auth from '../services/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {logout, ReponseUser, UserUnaadeb} from "../services/auth";


interface Props {
    children: React.ReactNode;
}

interface AuthContextData {
    signed: boolean;
    user: ReponseUser | null;

    signIn(email: string, password: string): Promise<void>;
    signUp(user: UserUnaadeb): Promise<void>;

    signOut(): void;

    loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);


export const AuthProvider: React.FC<Props> = ({children}) => {
    const [user, setUser] = useState<ReponseUser | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadStorageData() {
            setLoading(true)
            const user = await AsyncStorage.getItem('@UNAADEBAuth:user')
            const access_token = await AsyncStorage.getItem('@UNAADEBAuth:access_token')

            //todo: usar o expires e refresh_token
            //const refresh_token = await AsyncStorage.getItem('@UNAADEBAuth:refresh_token')
            //const expires = await AsyncStorage.getItem('@UNAADEBAuth:expires')

            if (user && access_token) {
                // api.defaults.headers['Authorization'] = `Bearer ${access_token}`;
                //todo: salvar usuário
                setUser(JSON.parse(user));
                setLoading(false)
            }

            setLoading(false)
        }
        loadStorageData();
    }, [])

    async function signIn(email: string, password: string) {
        const response = await auth.signIn(email, password)
        const {access_token, refresh_token, expires} = response;
        await AsyncStorage.setItem('@UNAADEBAuth:access_token', access_token)
        await AsyncStorage.setItem('@UNAADEBAuth:refresh_token', refresh_token)
        await AsyncStorage.setItem('@UNAADEBAuth:expires', String(expires))

        const user = await auth.getUser();
        await AsyncStorage.setItem('@UNAADEBAuth:user', JSON.stringify(user))
        setUser(user)
    }

    async function signUp(user: UserUnaadeb) {
        const response = await auth.signUp(user)
        console.log('responseCreateUser', response)

        // const {access_token, refresh_token, expires} = response;
        //
        // const user = await auth.getUser();
        // await AsyncStorage.setItem('@UNAADEBAuth:user', JSON.stringify(user))
        // setUser(user)
    }

    async function signOut() {
        const refresh_token = await AsyncStorage.getItem('@UNAADEBAuth:refresh_token')
        await logout(refresh_token)
        await AsyncStorage.clear()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{signed: !!user, user, signIn, signUp, signOut, loading}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;

export function useAuth() {
    const context = useContext(AuthContext)
    return context;
}
