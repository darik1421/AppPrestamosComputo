// Importaciones de React Navigation para la navegación en la app
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importaciones de iconos para usar en la navegación
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Pantallas de la app para la navegación
import HomeScreen from '../src/components/HomeScreen';
import Estadisticas from '../src/components/Estadisticas';
import Equipos from '../src/components/Equipos';


const Tab = createBottomTabNavigator();
function Tabs() {

    return (
        <Tab.Navigator initialRouteName='HomeScreen'>
            <Tab.Screen
                name='HomeScreen'
                component={HomeScreen}
                options={{
                    tabBarLabel: 'HomeScreen',
                   tabBarIcon: ({ color, size }) => (
                    <FontAwesome name="home" size={24} color={color} />
                    ),
                    headerShown: false,
                }}
            />
                <Tab.Screen
                name='Equipos'
                component={Equipos}
                options={{
                    tabBarLabel: 'Equipos',
                    tabBarIcon: ({ color, size }) => (
                      <FontAwesome name="desktop" size={24}  color={color} />
                    ),
                    headerShown: false,
                }}></Tab.Screen>

             <Tab.Screen
                name='Estadisticas'
                component={Estadisticas}
                options={{
                    tabBarLabel: 'Estadísticas',
                    tabBarIcon: ({ color, size }) => (
                      <FontAwesome name="bar-chart-o" size={24}  color={color} />
                    ),
                    headerShown: false,
                }}
            />
        </Tab.Navigator>
    );
};

// Componente principal que envuelve toda la navegación en un contenedor
export default function Navegacion() {
   
    return (
      <NavigationContainer>
        <Tabs/>
      </NavigationContainer>
    );
  }