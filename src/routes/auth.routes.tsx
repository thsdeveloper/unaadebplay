import SignIn from '../pages/SignIn';
import {createNativeStackNavigator} from '@react-navigation/native-stack'

const AuthStack = createNativeStackNavigator();

function AuthRoutes() {
    return (
        <AuthStack.Navigator>
            <AuthStack.Screen name="SignIn" component={SignIn}/>
        </AuthStack.Navigator>
    );
}

export default AuthRoutes;