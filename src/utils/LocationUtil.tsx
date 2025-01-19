// utils/LocationUtil.ts
import GetLocation, { Location } from 'react-native-get-location';
import { PermissionsAndroid, Platform } from 'react-native';

class LocationUtil {
    // 检查并请求定位权限
    static async checkAndRequestLocationPermission(): Promise<boolean> {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: '定位权限请求',
                    message: '应用需要访问您的位置以获取天气数据。',
                    buttonNeutral: '稍后询问',
                    buttonNegative: '取消',
                    buttonPositive: '同意',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else if (Platform.OS === 'ios') {
            // iOS 不需要显式请求权限，直接返回 true
            return true;
        }
        return false;
    }

    // 获取当前位置
    static async getCurrentLocation(): Promise<Location> {
        const hasPermission = await this.checkAndRequestLocationPermission();
        if (!hasPermission) {
            throw new Error('定位权限未授予');
        }

        return GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
        });
    }
}

export default LocationUtil;