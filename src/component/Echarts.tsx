import React, { useRef, useEffect } from "react";
import SkiaChart, { SkiaRenderer } from '@wuba/react-native-echarts/skiaChart';
import * as echarts from 'echarts/core';
import {
    BarChart,
    CustomChart,
    LineChart,
} from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DataZoomComponent,
} from 'echarts/components';
import ChartSkeleton from "./ChartSkeleton"; // 导入骨架图组件

// 注册扩展组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    SkiaRenderer,
    CustomChart,
    LineChart,
    DataZoomComponent,
    BarChart,
]);

interface EchartsProps {
    option?: any; // ECharts 配置
    width?: number; // 图表宽度
    height?: number; // 图表高度
    loading?: boolean; // 是否正在加载
    hasData?: boolean; // 是否有数据
}

// 初始化
function Echarts({ option = {}, width = 300, height = 250, loading = false, hasData = true }: EchartsProps) {
    const chartRef = useRef<any>(null);

    useEffect(() => {
        let chart: any;
        if (chartRef.current && hasData && !loading) {
            // @ts-ignore
            chart = echarts.init(chartRef.current, 'light', {
                renderer: 'canvas',
                width: width,
                height: height,
            });
            chart.setOption(option);
        }
        return () => chart?.dispose();
    }, [option, loading, hasData]);

    // 如果正在加载或没有数据，显示骨架图
    if (loading || !hasData) {
        return <ChartSkeleton width={width} height={height} />;
    }

    return <SkiaChart ref={chartRef} />;
}

export default Echarts;