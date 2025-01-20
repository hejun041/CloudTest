import React, { PureComponent } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppState, AppStateStatus, Dimensions, Image, Platform, ScaledSize, StatusBar, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
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

interface MAppState {
  isPortrait: boolean;
  appState: AppStateStatus;
  refresh: boolean;
}

class App extends PureComponent<{}, MAppState> {
  private dimensionSubscription: { remove: () => void } | undefined;
  private appStateSubscription: { remove: () => void } | undefined;

  constructor(props: {}) {
    super(props);
    this.state = {
      isPortrait: this.isPortrait(),
      appState: AppState.currentState,
      refresh: false,
    };
  }

  componentDidMount() {
    this.dimensionSubscription = Dimensions.addEventListener('change', this.handleOrientationChange);
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    if (this.dimensionSubscription) {
      this.dimensionSubscription.remove();
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove()
    }
  }

  showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      //TODO:自定义iOS Toast
      // this.showAlert(DropdownAlertType.Info, 'Info', message);
    }
  };

  isPortrait = (): boolean => {
    const { width, height } = Dimensions.get('window');
    return height >= width;
  };

  handleAppStateChange = (nextAppState: AppStateStatus) => {
    const { appState } = this.state;

    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      this.setState({ refresh: true })
    } else if (nextAppState === 'background') {
      this.showToast('APP 正在后台运行');
      this.setState({ refresh: false })
    }

    // 更新应用状态
    this.setState({ appState: nextAppState });
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
              <Tab.Screen name="Chart">{() => <Chart isPortrait={isPortrait} refresh={this.state.refresh} />}</Tab.Screen>
              <Tab.Screen name="Table">{() => <Table isPortrait={isPortrait} refresh={this.state.refresh} />}</Tab.Screen>
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