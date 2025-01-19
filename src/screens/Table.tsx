import React, { PureComponent } from "react";
import { View, StyleSheet, Dimensions, InteractionManager, StatusBar, Text, RefreshControl } from "react-native";
import { fetchWithRetry } from "../utils/RequestUtil";
import Service from "../api/Service";
import AlertContext from "../context/AlertContext";
import { DropdownAlertType } from "react-native-dropdownalert";
import { FlashList } from "@shopify/flash-list";
import LocationUtil from "../utils/LocationUtil";
import TableSkeleton from "../component/TableSkeleton";

interface State {
    refreshing: boolean; // 下拉刷新状态
    weatherData: {
        hourly?: {
            time: string[];
            temperature_2m: number[];
        };
    };
    tableData: { time: string; temperature: number }[]; // 格式化后的表格数据
    forecastDays: number; // 当前加载的天数
    hasMoreData: boolean; // 是否还有更多数据
    errorMessage: string | null; // 错误信息
    latitude: string | null; // 纬度
    longitude: string | null; // 经度
}

interface TableProps {
    isPortrait: boolean;
}

export default class Table extends PureComponent<TableProps, State> {
    static contextType = AlertContext;

    constructor(props: TableProps) {
        super(props);
        this.state = {
            refreshing: false,
            weatherData: {},
            tableData: [],
            forecastDays: 1, // 初始加载 1 天数据
            hasMoreData: true, // 默认有更多数据
            errorMessage: null, // 初始无错误信息
            latitude: null, // 初始纬度
            longitude: null // 初始经度
        };
    }

    componentDidMount(): void {
        InteractionManager.runAfterInteractions(() => {
            this.getLocationAndFetchData();
        });
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
                () => this.fetchData()
            );
        } catch (error) {
            const { showAlert } = this.context as { showAlert: (type: string, title: string, message: string) => void };
            showAlert(DropdownAlertType.Error, 'Error', '获取位置失败，请检查定位权限！');
            this.setState({ refreshing: false });
        }
    };

    fetchData = () => {
        const { showAlert } = this.context as { showAlert: (type: string, title: string, message: string) => void };
        const { forecastDays, latitude, longitude } = this.state;

        if (forecastDays >= 17) {
            this.setState({
                hasMoreData: false,
                errorMessage: "没有更多数据了",
                refreshing: false
            });
            return;
        }

        const params = {
            latitude: latitude || "52.52", // 使用获取到的纬度，如果未获取到则使用默认值
            longitude: longitude || "13.41", // 使用获取到的经度，如果未获取到则使用默认值
            hourly: 'temperature_2m',
            timezone: 'Asia/Singapore',
            forecast_days: forecastDays + ''
        };
        const queryString = new URLSearchParams(params).toString();
        fetchWithRetry(Service.weather + queryString, { method: 'GET' }).then((res) => {
            const formattedData = this.formatData(res);
            this.setState({
                weatherData: res,
                tableData: formattedData,
                refreshing: false,
                hasMoreData: true, // 重置为有更多数据
                errorMessage: null // 清空错误信息
            });
        }).catch(() => {
            showAlert(DropdownAlertType.Error, 'Error', '请求错误请稍后重试！');
            this.setState({ weatherData: {}, refreshing: false });
        });
    };

    // 格式化数据
    formatData = (data: any) => {
        const timeData = data.hourly?.time || [];
        const temperatureData = data.hourly?.temperature_2m || [];

        return timeData.map((time: string, index: number) => ({
            time: this.formatTime(time), // 格式化时间
            temperature: temperatureData[index] // 温度数据
        }));
    };

    // 格式化时间，保留年月日
    formatTime = (time: string): string => {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份补零
        const day = String(date.getDate()).padStart(2, '0'); // 日期补零
        const hours = String(date.getHours()).padStart(2, '0'); // 小时补零
        return `${year}-${month}-${day} ${hours}:00`; // 格式化为 "YYYY-MM-DD HH:00"
    };

    // 加载更多数据
    loadMoreData = () => {
        const { hasMoreData, refreshing, tableData } = this.state;
        if (hasMoreData && !refreshing && tableData.length) {
            this.setState(
                (prevState) => ({ forecastDays: prevState.forecastDays + 1 }),
                () => this.fetchData() // 加载更多数据
            );
        }
    };

    // 下拉刷新
    handleRefresh = () => {
        this.setState({ refreshing: true, forecastDays: 1, hasMoreData: true }, () => {
            this.fetchData(); // 重新加载数据
        });
    };

    // 渲染表格行
    renderRow = ({ item }: { item: { time: string; temperature: number } }) => {
        return (
            <View style={styles.row}>
                <Text style={styles.cell}>{item.time}</Text>
                <Text style={styles.cell}>{item.temperature}°C</Text>
            </View>
        );
    };

    // 渲染底部组件
    renderFooter = () => {
        const { hasMoreData, errorMessage } = this.state;
        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {hasMoreData ? "加载更多" : (errorMessage || "没有更多数据了")}
                </Text>
            </View>
        );
    };

    render() {
        const { tableData, refreshing, hasMoreData, errorMessage } = this.state;
        const { width } = Dimensions.get('window');
        if (refreshing) {
            return (
                <View style={styles.container}>
                    <TableSkeleton width={width - 32} height={500} rowCount={10} />
                </View>
            );
        }
        return (
            <View style={styles.container}>
                {/* 表头 */}
                <View style={styles.header}>
                    <Text style={styles.headerCell}>时间</Text>
                    <Text style={styles.headerCell}>温度（°C）</Text>
                </View>

                {/* 表格内容 */}
                <FlashList
                    data={tableData}
                    renderItem={this.renderRow}
                    keyExtractor={(item) => item.time.toString()}
                    estimatedItemSize={50} // 预估每行高度
                    onEndReached={this.loadMoreData} // 加载更多
                    onEndReachedThreshold={0.5} // 触发加载更多的阈值
                    extraData={{ hasMoreData, errorMessage }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={this.handleRefresh} // 下拉刷新
                            colors={['#5470C6']} // 刷新指示器颜色
                        />
                    }
                    ListFooterComponent={this.renderFooter} // 底部组件
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFF'
    },
    header: {
        flexDirection: 'row',
        backgroundColor: '#5470C6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
    },
    headerCell: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: '#DDD',
        borderLeftWidth: 1,
        borderRightWidth: 1
    },
    cell: {
        flex: 1,
        fontSize: 14,
        textAlign: 'center',
        color: '#333',
    },
    footer: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    footerText: {
        fontSize: 14,
        color: '#666'
    }
});
