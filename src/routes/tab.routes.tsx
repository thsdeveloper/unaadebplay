import Dashboard from '../pages/Dashboard';
import ForgetPassword from '../pages/ForgetPassword';
import {MaterialIcons} from '@expo/vector-icons'


import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'

const DashboardStack = createBottomTabNavigator();

function TabRoutes() {
    return (
        <DashboardStack.Navigator>
            <DashboardStack.Screen name="Dashboard" component={Dashboard} options={
                {
                    title: 'UNAADEB',
                    tabBarLabel: 'Home',
                    tabBarIcon: ({color, size}) => (
                        <MaterialIcons name={'home'} color={color} size={size} />
                    )
                }
            }/>
            <DashboardStack.Screen name="ForgetPassword" component={ForgetPassword} options={
                {
                    tabBarLabel: 'Redefinir senha',
                    tabBarIcon: ({color, size}) => (
                        <MaterialIcons name={'add'} color={color} size={size} />
                    )
                }
            }/>
        </DashboardStack.Navigator>
    );
}

export default TabRoutes;