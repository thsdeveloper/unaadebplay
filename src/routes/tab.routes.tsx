import Dashboard from '../pages/app/Dashboard';
import ForgetPassword from '../pages/ForgetPassword';
import About from "../pages/app/About";
import {MaterialIcons, FontAwesome5, FontAwesome} from '@expo/vector-icons'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Contact from "../pages/app/Contact";
import Settings from "../pages/app/Settings";
import News from "../pages/app/News";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardScreen() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={Dashboard} options={{headerShown: false}} />
            <Stack.Screen name="Contact" component={Contact} options={{headerShown: false}} />
            <Stack.Screen name="About" component={About} />
        </Stack.Navigator>
    );
}

function NewsScreen() {
    return (
        <Stack.Navigator screenOptions={{
            title: 'Ultimas notícias'
        }}>
            <Stack.Screen name="newss" component={News} />
        </Stack.Navigator>
    );
}

function SettingsScreen() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Settings" component={Settings} />
        </Stack.Navigator>
    );
}




function TabRoutes() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Dashboard" component={DashboardScreen} options={
                {
                    title: 'UNAADEB',
                    headerStyle: {
                        backgroundColor: 'red',
                    },
                    headerTintColor: 'blue',
                    tabBarLabel: 'UNAADEB 2023',
                    tabBarIcon: ({color, size}) => (
                        <FontAwesome5 name={'fire'} color={color} size={size} />
                    )
                }
            }/>
            <Tab.Screen name="News" component={NewsScreen} options={
                {
                    headerShown: false,
                    tabBarLabel: 'Notícias',
                    tabBarIcon: ({color, size}) => (
                        <FontAwesome5 name={'newspaper'} color={color} size={size} />
                    )
                }
            }/>
            <Tab.Screen name="SettingsScreen" component={SettingsScreen} options={
                {
                    tabBarLabel: 'Agenda',
                    tabBarIcon: ({color, size}) => (
                        <FontAwesome name={'calendar'} color={color} size={size} />
                    )
                }
            }/>
            <Tab.Screen name="media" component={SettingsScreen} options={
                {
                    tabBarLabel: 'Configurações',
                    tabBarIcon: ({color, size}) => (
                        <MaterialIcons name={'settings'} color={color} size={size} />
                    )
                }
            }/>
        </Tab.Navigator>
    );
}

export default TabRoutes;