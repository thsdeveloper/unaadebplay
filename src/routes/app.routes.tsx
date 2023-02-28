import Dashboard from '../pages/Dashboard';
import {createNativeStackNavigator} from '@react-navigation/native-stack'

const DashboardStack = createNativeStackNavigator();

function AuthRoutes() {
    return (
        <DashboardStack.Navigator>
            <DashboardStack.Screen name="Dashboard" component={Dashboard}/>
        </DashboardStack.Navigator>
    );
}

export default AuthRoutes;