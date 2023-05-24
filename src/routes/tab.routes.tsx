import Dashboard from '../pages/app/Dashboard';
import {Ionicons, FontAwesome5, FontAwesome} from '@expo/vector-icons'
import Colors from '../constants/colors'

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import Contact from "../pages/app/Contact";
import Settings from "../pages/app/Settings";

import Events from "../pages/app/Events";
import RepertoireListScreen from "../pages/app/Dashboard/RepertoireListScreen";
import React from "react";
import GlobalAudioPlayer from "../components/GlobalAudioPlayer";
import FlashMessage from "react-native-flash-message";
import EventDetailsPage from "../pages/app/Events/EventDetailsPage";
import PostsPage from "../pages/app/Posts";
import PostDetailsPage from "../pages/app/Posts/PostDetailsPage";
import UserProfile from "../pages/app/Users/UserProfile";
import colors from "../constants/colors";
import {Button} from "../components/Button";
import {TouchableOpacity} from "react-native";
import Contribua from "../pages/app/Dashboard/Contribua";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function DashboardScreen() {
    return (
        <>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={Dashboard} options={{headerShown: false}}/>
                <Stack.Screen name="Contact" component={Contact} options={{headerShown: false}}/>
                <Stack.Screen name="RepertoireList" component={RepertoireListScreen} options={{headerShown: false}}/>
                <Stack.Screen name="UserProfile" component={UserProfile} options={{headerShown: false}}/>
                <Stack.Screen name="Contribua" component={Contribua} options={{headerShown: false}}/>
            </Stack.Navigator>
        </>
    );
}

function PostsScreen() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Posts" component={PostsPage}/>
            <Stack.Screen name="PostsDetails" component={PostDetailsPage}/>
        </Stack.Navigator>
    );
}

function EventosScreen() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Events" component={Events}/>
            <Stack.Screen name="EventsDetails" component={EventDetailsPage}/>
        </Stack.Navigator>
    );
}

function SettingsScreen() {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Settings" component={Settings}/>
        </Stack.Navigator>
    );
}


function TabRoutes() {
    return (
        <>
            <FlashMessage position="top"/>
            <GlobalAudioPlayer/>

            <Tab.Navigator screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary
                },
                tabBarIconStyle: {
                    color: colors.primary,
                    // backgroundColor: colors.primary,
                    // borderWidth: 1,
                    // borderRadius: '100%',
                    // width: '100%'
                },
                tabBarStyle: {
                    backgroundColor: Colors.secundary,
                    // paddingHorizontal: 0,
                    // paddingVertical: 0,
                    // height: 60
                },
                tabBarLabelStyle: {
                    color: Colors.text,
                    // marginBottom: 5
                }
            }}>
                <Tab.Screen name="Dashboard" component={DashboardScreen} options={
                    {
                        headerShown: false,
                        // tabBarShowLabel: false,
                        tabBarLabel: 'UNAADEB',
                        tabBarIcon: ({color, size}) => (
                            <FontAwesome5 name={'fire'} color={color} size={size}/>
                        )
                    }
                }/>
                <Tab.Screen name="News" component={PostsScreen} options={
                    {
                        headerShown: false,
                        tabBarLabel: 'Notícias',
                        tabBarIcon: ({color, size}) => (
                            <FontAwesome5 name={'newspaper'} color={color} size={size}/>
                        )
                    }
                }/>
                <Tab.Screen name="Eventos" component={EventosScreen} options={
                    {
                        headerShown: false,
                        tabBarLabel: 'Eventos',
                        tabBarIcon: ({color, size}) => (
                            <FontAwesome name={'calendar'} color={color} size={size}/>
                        )
                    }
                }/>
                <Tab.Screen name="Configuracoes" component={SettingsScreen} options={
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

export default TabRoutes;