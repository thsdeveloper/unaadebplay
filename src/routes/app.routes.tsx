import Dashboard from '../pages/Dashboard';
import Contact from '../pages/app/Contact';
import About from '../pages/app/About';


import {createNativeStackNavigator} from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MyTabs() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={Dashboard} />
            <Tab.Screen name="Settings" component={Dashboard} />
        </Tab.Navigator>
    );
}

function MyStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="About" component={About} />
            <Stack.Screen name="Contact" component={Contact} />
        </Stack.Navigator>
    );
}

function AuthRoutes() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={Dashboard} />
            <Tab.Screen name="About" component={About} />
        </Tab.Navigator>
    );
}

export default AuthRoutes;