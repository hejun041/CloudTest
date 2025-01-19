import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";

interface TableSkeletonProps {
    width?: number; // 表格宽度
    height?: number; // 表格高度
    rowCount?: number; // 行数
}

const TableSkeleton = ({ width = 300, height = 250, rowCount = 5 }: TableSkeletonProps) => {
    const rowHeight = 50; // 每行的高度
    const headerHeight = 50; // 表头的高度
    const padding = 16; // 容器的内边距

    return (
        <ContentLoader
            speed={2}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
        >
            {/* 模拟表头 */}
            <Rect x={padding} y={padding} rx="4" ry="4" width={width - 2 * padding} height={headerHeight} />

            {/* 模拟表格行 */}
            {Array.from({ length: rowCount }).map((_, index) => (
                <Rect
                    key={index}
                    x={padding}
                    y={padding + headerHeight + index * rowHeight}
                    rx="4"
                    ry="4"
                    width={width - 2 * padding}
                    height={rowHeight - 10}
                />
            ))}
        </ContentLoader>
    );
};

export default TableSkeleton;