import Dashboard from '../pages/app/Dashboard';
import {createDrawerNavigator} from '@react-navigation/drawer'

const Drawer = createDrawerNavigator();

function DrawerRoutes() {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Dashboard" component={Dashboard}/>
        </Drawer.Navigator>
    );
}

export default DrawerRoutes;