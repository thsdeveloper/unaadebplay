import {createNativeStackNavigator} from '@react-navigation/native-stack'
import Dashboard from "../pages/app/Dashboard";
import Contact from "../pages/app/Contact";
import Repertories from "../app/(tabs)/(home)/repertories";
import UserProfile from "../pages/app/Users/UserProfile";
import UserListPage from "../app/(tabs)/(home)/users";
import Contribua from "@/app/(tabs)/(home)/contribua";
import CongressoPage from "../pages/app/Congresso";
import YoutubePage from "../app/(tabs)/(home)/youtube";
import React from "react";

const Stack = createNativeStackNavigator();

export default function StackRoutes() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="contact" component={Contact} options={{headerShown: true}}/>
            <Stack.Screen name="repertories" component={Repertories} options={{headerShown: true}}/>
            <Stack.Screen name="user" component={UserProfile} options={{
                headerShown: true,
                headerBackTitle: "Voltar",
                title: 'Membro'
            }}/>
            <Stack.Screen name="users" component={UserListPage} options={{
                headerShown: true,
                headerBackTitle: "Voltar",
                title: 'Membros'
            }}/>
            <Stack.Screen name="contribua" component={Contribua} options={{
                headerShown: true,
                headerBackTitle: "Voltar",
                title: 'Contribua com a UNAADEB'
            }}/>
            <Stack.Screen name="congresso" component={CongressoPage} options={{
                headerShown: true,
                headerBackTitle: "Voltar",
                title: 'O Congresso'
            }}/>
            <Stack.Screen name="youtube" component={YoutubePage} options={{
                headerShown: true,
                headerBackTitle: "Voltar",
                title: 'Canal do Youtube'
            }} />
        </Stack.Navigator>
    );
}