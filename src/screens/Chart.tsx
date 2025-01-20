import { PureComponent, ReactNode } from "react";
import { Dimensions, InteractionManager, StatusBar, StyleSheet, View, RefreshControl, ScrollView } from "react-native";
import { fetchWithRetry } from "../utils/RequestUtil";
import Service from "../api/Service";
import AlertContext from "../context/AlertContext";
import { DropdownAlertType } from "react-native-dropdownalert";
import Echarts from "../component/Echarts";
import LocationUtil from "../utils/LocationUtil";

interface State {
    loading: boolean;
    weatherData: {
        hourly?: {
            time: string[];
            temperature_2m: number[];
        };
    };
    latitude: string | null; // 纬度
    longitude: string | null; // 经度
}

interface ChartProps {
    isPortrait: boolean;
    refresh: boolean;
}

export default class Chart extends PureComponent<ChartProps, State> {
    static contextType = AlertContext;

    constructor(props: ChartProps) {
        super(props);
        this.state = {
            loading: false,
            weatherData: {},
            latitude: null, // 初始纬度
            longitude: null // 初始经度
        };
    }

    componentDidMount(): void {
        InteractionManager.runAfterInteractions(() => {
            this.getLocationAndFetchData(); // 获取位置并请求数据
        });
    }

    componentDidUpdate(prevProps: ChartProps) {
        if (this.props.refresh && !prevProps.refresh) {
            this.fetchData();
        }
    }

    // 获取位置并请求数据
    getLocationAndFetchData = async () => {
        try {
            const location = await LocationUtil.getCurrentLocation();
            this.setState(
                {
                    latitude: location.latitude.toString(),
                    longitude: location.longitude.toString()
                },
                () => this.fetchData() // 获取数据
            );
        } catch (error) {
            const { showAlert } = this.context as { showAlert: (type: string, title: string, message: string) => void };
            showAlert(DropdownAlertType.Error, 'Error', '获取位置失败，请检查定位权限！');
            this.setState({ loading: false });
        }
    };

    // 请求数据
    fetchData = () => {
        const { showAlert } = this.context as { showAlert: (type: string, title: string, message: string) => void };
        const { latitude, longitude } = this.state;

        this.setState({ loading: true });

        const params = {
            latitude: latitude || "52.52", // 使用获取到的纬度，如果未获取到则使用默认值
            longitude: longitude || "13.41", // 使用获取到的经度，如果未获取到则使用默认值
            hourly: 'temperature_2m',
        };
        const queryString = new URLSearchParams(params).toString();
        fetchWithRetry(Service.weather + queryString, { method: 'GET' }).then((res) => {
            if (res) {
                this.setState({ weatherData: res, loading: false });
            }
        }).catch(() => {
            showAlert(DropdownAlertType.Error, 'Error', '请求错误请稍后重试！');
            this.setState({ weatherData: {}, loading: false });
        });
    };

    // 下拉刷新
    handleRefresh = () => {
        this.setState({ loading: true }, () => {
            this.getLocationAndFetchData(); // 重新获取数据
        });
    };

    formatTime = (time: string): string => {
        const date = new Date(time);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
    };

    render(): ReactNode {
        const { weatherData, loading } = this.state;
        const { isPortrait } = this.props;
        const { width, height } = Dimensions.get('window');

        const chartWidth = isPortrait ? width - 20 : width - 70;
        const chartHeight = height - 75 - (StatusBar.currentHeight || 20);
        const option = {
            title: {
                text: '每小时温度'
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const date = new Date(params[0].axisValue);
                    return `${date.toLocaleDateString()} ${date.getHours()}:00 \n 温度: ${params[0].data} °C`;
                }
            },
            xAxis: {
                type: 'category',
                data: weatherData?.hourly?.time || [],
                axisLabel: {
                    formatter: (value: string) => this.formatTime(value)
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: '{value} °C'
                }
            },
            dataZoom: [
                {
                    type: 'slider',
                    start: 0,
                    end: 100
                },
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                }
            ],
            series: [{
                data: weatherData?.hourly?.temperature_2m || [],
                type: 'line',
                smooth: true,
                name: '温度',
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c} °C'
                }
            }]
        };

        return (
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={this.handleRefresh} // 下拉刷新
                        colors={['#5470C6']} // 刷新指示器颜色
                    />
                }
            >
                <View style={styles.chartContainer}>
                    <Echarts
                        option={option}
                        width={chartWidth}
                        height={chartHeight}
                        loading={loading}
                        hasData={!!weatherData?.hourly?.time?.length}
                    />
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chartContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 16, // 顶部留出空间
    },
});