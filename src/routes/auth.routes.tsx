import SignIn from '../pages/SignIn';
import SignUp from "../pages/SignUp";
import ForgetPassword from "../pages/ForgetPassword";
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import Colors from "../constants/colors";
import FlashMessage from "react-native-flash-message";
import React from "react";

const AuthStack = createNativeStackNavigator();

function AuthRoutes() {
    return (
        <>
            <FlashMessage position="top"/>
            <AuthStack.Navigator screenOptions={{navigationBarHidden: true, headerTintColor: Colors.text, headerStyle: {backgroundColor: Colors.secundary}}}>
                <AuthStack.Screen name="SignIn" component={SignIn} options={{headerShown: false}}/>
                <AuthStack.Screen name="SignUp" component={SignUp} options={{headerShown: true, title: 'Cadastre-se'}} />
                <AuthStack.Screen name="ForgetPassword" component={ForgetPassword} options={{title: 'Recupere a sua senha'}}/>
            </AuthStack.Navigator>
        </>
    );
}

export default AuthRoutes;