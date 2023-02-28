import React, {createContext, useState, useEffect, useContext} from 'react'
import * as auth from '../services/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../services/api'


interface Props {
    children: React.ReactNode;
}

interface AuthContextData {
    signed: boolean;
    user: object | null;

    signIn(): Promise<void>;

    signOut(): void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);


export const AuthProvider: React.FC<Props> = ({children}) => {
    const [user, setUser] = useState<Object | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadStorageData() {
            setLoading(true)
            const storageUser = await AsyncStorage.getItem('@UNAADEBAuth:user')
            const storageToken = await AsyncStorage.getItem('@UNAADEBAuth:token')
            if (storageUser && storageToken) {

                api.defaults.headers['Authorization'] = `Bearer ${storageToken}`;

                setUser(JSON.parse(storageUser));
                setLoading(false)
            }
            setLoading(false)
        }

        loadStorageData();
    }, [])

    async function signIn() {
        const response = await auth.signIn()
        const {token, user} = response;

        setUser(user)

        await AsyncStorage.setItem('@UNAADEBAuth:user', JSON.stringify(user))
        await AsyncStorage.setItem('@UNAADEBAuth:token', token)
    }

    function signOut() {
        AsyncStorage.clear().then(() => {
            setUser(null)
        })
    }

    return (
        <AuthContext.Provider value={{signed: !!user, user, signIn, signOut, loading}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;

export function useAuth(){
    const context = useContext(AuthContext)
    return context;
}
