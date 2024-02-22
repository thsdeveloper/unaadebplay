import SignIn from '@/ap_back/auth/sign-in';
import SignUp from "@/app/(auth)/sign-up";
import ForgetPassword from "@/app/(auth)/forget-password";
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