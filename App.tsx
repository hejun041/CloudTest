import React, { PureComponent } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dimensions, Image, ScaledSize, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DropdownAlert, {
  DropdownAlertColor,
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';
import Chart from './src/screens/Chart';
import Table from './src/screens/Table';
import AlertContext from './src/context/AlertContext';
import { NavigationContainer } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

// 创建 alert 函数变量
let alert = (_data: DropdownAlertData) => new Promise<DropdownAlertData>((res) => res);

interface AppState {
  isPortrait: boolean;
}

class App extends PureComponent<{}, AppState> {
  private dimensionSubscription: { remove: () => void } | undefined;

  constructor(props: {}) {
    super(props);
    this.state = {
      isPortrait: this.isPortrait(),
    };
  }

  componentDidMount() {
    this.dimensionSubscription = Dimensions.addEventListener('change', this.handleOrientationChange);
  }

  componentWillUnmount() {
    if (this.dimensionSubscription) {
      this.dimensionSubscription.remove();
    }
  }

  isPortrait = (): boolean => {
    const { width, height } = Dimensions.get('window');
    return height >= width;
  };

  handleOrientationChange = ({ window }: { window: ScaledSize }) => {
    this.setState({ isPortrait: window.height >= window.width });
  };

  showAlert = (type: DropdownAlertType, title: string, message: string) => {
    alert({
      type,
      title,
      message,
    });
  };

  //自定义TabBar
  renderTabBarButton = (props: any) => {
    const { route, onPress, accessibilityState } = props;
    const isFocused = accessibilityState.selected;
    const color = isFocused ? '#007BFF' : '#333';
    const fontWeight = isFocused ? 'bold' : 'normal';

    let iconSource;
    if (route.name === 'Chart') {
      iconSource = require('./src/assets/chart.png');
    } else if (route.name === 'Table') {
      iconSource = require('./src/assets/table.png');
    }

    return (
      <TouchableOpacity
        style={styles.customButton}
        onPress={onPress}
      >
        <Image source={iconSource} style={[styles.iconStyle, { tintColor: color }]} />
        <Text style={[styles.tabLabel, { color, fontWeight }]}>{route.name}</Text>
      </TouchableOpacity>
    );
  };

  render() {
    const { isPortrait } = this.state;
    return (
      <AlertContext.Provider value={{ showAlert: this.showAlert }}>
        <View style={{ flex: 1 }}>
          <StatusBar translucent backgroundColor="transparent" barStyle='dark-content' />
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarButton: (props) => this.renderTabBarButton({ ...props, route }),
                tabBarPosition: isPortrait ? 'bottom' : 'left',
                tabBarLabelPosition: 'below-icon',
                tabBarVariant: isPortrait ? 'uikit' : 'material',
                headerStyle: styles.headerStyle,
                headerTitleStyle: styles.headerTitleStyle,
                tabBarItemStyle: { flex: 1 },
                animation: 'none',
              })}>
              <Tab.Screen name="Chart">{() => <Chart isPortrait={isPortrait} />}</Tab.Screen>
              <Tab.Screen name="Table">{() => <Table isPortrait={isPortrait} />}</Tab.Screen>
            </Tab.Navigator>
          </NavigationContainer>
          <DropdownAlert alert={(func) => (alert = func)} alertViewStyle={styles.alertStyle} />
        </View>
      </AlertContext.Provider>
    );
  }
}

export default App;

const styles = StyleSheet.create({
  iconStyle: { width: 24, height: 24 },
  customButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  headerStyle: {
    height: 70,
  },
  headerTitleStyle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  alertStyle: {
    padding: 8,
    marginTop: 10,
    backgroundColor: DropdownAlertColor.Default,
  },
})