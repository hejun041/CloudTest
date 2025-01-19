import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";

interface ChartSkeletonProps {
    width?: number; // 图表宽度
    height?: number; // 图表高度
}

const ChartSkeleton = ({ width = 300, height = 250 }: ChartSkeletonProps) => {
    // 动态计算骨架图元素的位置和大小
    const titleY = 10; // 标题的 Y 坐标
    const axisX = 40; // X 轴的 X 坐标
    const axisY = height - 30; // X 轴的 Y 坐标
    const chartHeight = height - 60; // 图表区域的高度
    const chartWidth = width - 50; // 图表区域的宽度

    return (
        <ContentLoader
            speed={2}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`} // 动态设置 viewBox
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
        >
            {/* 模拟图表标题 */}
            <Rect x="10" y={titleY} rx="3" ry="3" width="150" height="10" />

            {/* 模拟 Y 轴 */}
            <Rect x={axisX} y={titleY + 20} rx="3" ry="3" width="10" height={chartHeight} />

            {/* 模拟 X 轴 */}
            <Rect x={axisX} y={axisY} rx="3" ry="3" width={chartWidth} height="10" />

            {/* 模拟折线图的骨架 */}
            <Rect x={axisX + 20} y={axisY - 50} rx="3" ry="3" width="20" height="100" />
            <Rect x={axisX + 60} y={axisY - 80} rx="3" ry="3" width="20" height="130" />
            <Rect x={axisX + 100} y={axisY - 60} rx="3" ry="3" width="20" height="110" />
            <Rect x={axisX + 140} y={axisY - 70} rx="3" ry="3" width="20" height="120" />
            <Rect x={axisX + 180} y={axisY - 90} rx="3" ry="3" width="20" height="140" />
            <Rect x={axisX + 220} y={axisY - 50} rx="3" ry="3" width="20" height="100" />
        </ContentLoader>
    );
};

export default ChartSkeleton;