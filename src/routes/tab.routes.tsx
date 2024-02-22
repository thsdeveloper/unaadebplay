import Dashboard from '../pages/app/Dashboard';
import {Ionicons, FontAwesome5, FontAwesome, Feather} from '@expo/vector-icons'

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Settings from "../pages/app/Index";
import Events from "../pages/app/Events";
import React from "react";
import EventDetailsPage from "../pages/app/Events/EventDetailsPage";
import PostsPage from "../pages/app/Posts";
import PostDetailsPage from "../pages/app/Posts/PostDetailsPage";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PostsScreen() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="home" component={PostsPage}/>
            <Stack.Screen name="details" component={PostDetailsPage} options={{
                headerShown: true,
                headerBackTitle: "Voltar",
                title: 'Notícias'
            }}/>
        </Stack.Navigator>
    );
}

function EventosScreen() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="home" component={Events}/>
            <Stack.Screen name="details" component={EventDetailsPage} options={{
                headerShown: true,
                headerBackTitle: "Voltar", // Personaliza o texto do botão de voltar (iOS principalmente)
                title: 'Eventos'
            }}/>
        </Stack.Navigator>
    );
}

function SettingsScreen() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="home" component={Settings}/>
        </Stack.Navigator>
    );
}

export default function TabRoutes() {
    return (
        <>
            <Tab.Navigator>
                <Tab.Screen name="dashboard" component={Dashboard} options={
                    {
                        headerShown: false,
                        // tabBarShowLabel: false,
                        tabBarLabel: 'UNAADEB',
                        tabBarIcon: ({color, size}) => (
                            <Feather name="youtube" size={size} color={color} />
                        )
                    }
                }/>
                <Tab.Screen name="posts" component={PostsScreen} options={
                    {
                        headerShown: false,
                        tabBarLabel: 'Notícias',
                        tabBarIcon: ({color, size}) => (
                            <FontAwesome5 name={'newspaper'} color={color} size={size}/>
                        )
                    }
                }/>
                <Tab.Screen name="events" component={EventosScreen} options={
                    {
                        headerShown: false,
                        tabBarLabel: 'Eventos',
                        tabBarIcon: ({color, size}) => (
                            <FontAwesome name={'calendar'} color={color} size={size}/>
                        )
                    }
                }/>
                <Tab.Screen name="settings" component={SettingsScreen} options={
                    {
                        headerShown: false,
                        tabBarLabel: 'Meu Perfil',
                        tabBarIcon: ({color, size}) => (
                            <Ionicons name={'person'} color={color} size={size}/>
                        )
                    }
                }/>
            </Tab.Navigator>

        </>
    );
}