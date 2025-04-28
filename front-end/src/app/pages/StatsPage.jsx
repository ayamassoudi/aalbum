import { useEffect, useState } from "react";
import { useAuthStore } from "../../hooks/useAuthStore";
import { useStatsStore } from "../../hooks/useStatsStore";
import ReactECharts from 'echarts-for-react';
import { Card } from "flowbite-react/lib/cjs/index.js";
import { Box, Typography } from "@mui/material";
import { Assessment, PhotoLibrary, Collections } from "@mui/icons-material";

export const StatsPage = () => {
    const { user } = useAuthStore();
    const { stats, statsX, statsY, albumCount, photoCount, startLoadingStats } = useStatsStore();
    const [options, setOptions] = useState({});
    const [options2, setOptions2] = useState({});
    const [options3, setOptions3] = useState({});
    const [options4, setOptions4] = useState({});
    const [options5, setOptions5] = useState({});

    useEffect(() => {
        startLoadingStats();
    }, []);

    useEffect(() => {
        if (statsX[0]) {
            loadGraphic();
            loadGraphic2();
            loadGraphic3();
            loadGraphic4();
            loadGraphic5();
        }
    }, [stats, statsX, statsY]);

    const loadGraphic = () => {
        setOptions({
            grid: { top: 8, right: 8, bottom: 24, left: 36 },
            xAxis: {
                type: 'category',
                data: statsX,
            },
            yAxis: {
                type: 'value',
            },
            series: [
                {
                    data: statsY,
                    type: 'bar',
                    itemStyle: {
                        color: '#6366f1'
                    }
                },
            ],
            tooltip: {
                trigger: 'axis',
            },
        });
    };

    const loadGraphic2 = () => {
        setOptions2({
            grid: { top: 8, right: 8, bottom: 24, left: 36 },
            xAxis: {
                type: 'category',
                data: statsX,
            },
            yAxis: {
                type: 'value',
            },
            series: [
                {
                    data: statsY,
                    type: 'line',
                    areaStyle: {
                        color: '#818cf8'
                    },
                    lineStyle: {
                        color: '#6366f1'
                    },
                    itemStyle: {
                        color: '#6366f1'
                    }
                },
            ],
            tooltip: {
                trigger: 'axis',
            },
        });
    };

    const loadGraphic3 = () => {
        setOptions3({
            grid: { top: 8, right: 8, bottom: 24, left: 36 },
            xAxis: {
                type: 'category',
                data: statsX,
            },
            yAxis: {
                type: 'value',
            },
            series: [
                {
                    data: statsY,
                    type: 'line',
                    smooth: true,
                    lineStyle: {
                        color: '#6366f1'
                    },
                    itemStyle: {
                        color: '#6366f1'
                    }
                },
            ],
            tooltip: {
                trigger: 'axis',
            },
        });
    };

    const loadGraphic4 = () => {
        setOptions4({
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '5%',
                left: 'center'
            },
            series: [
                {
                    name: 'Album Stats',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '24',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: stats
                }
            ]
        });
    };

    const loadGraphic5 = () => {
        setOptions5({
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '5%',
                left: 'center'
            },
            series: [
                {
                    name: 'Album Stats',
                    type: 'pie',
                    radius: [20, 140],
                    center: ['50%', '50%'],
                    roseType: 'area',
                    itemStyle: {
                        borderRadius: 8,
                        color: function(params) {
                            const colors = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];
                            return colors[params.dataIndex % colors.length];
                        }
                    },
                    data: stats
                }
            ]
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
                    Statistics Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome back, {user.firstName} {user.lastName}
                </Typography>
            </Box>

            {statsX[0] ? (
                <>
                    <Card className="mb-6">
                        <div className="p-6">
                            <Box sx={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Collections className="w-12 h-12 mx-auto mb-2 text-indigo-600" />
                                    <Typography variant="h4" fontWeight="bold" color="primary">
                                        {albumCount}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Albums
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <PhotoLibrary className="w-12 h-12 mx-auto mb-2 text-indigo-600" />
                                    <Typography variant="h4" fontWeight="bold" color="primary">
                                        {photoCount}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Photos
                                    </Typography>
                                </Box>
                            </Box>
                        </div>
                    </Card>

                    <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', mb: 4 }}>
                        <Card>
                            <div className="p-4">
                                <Typography variant="h6" gutterBottom className="flex items-center gap-2">
                                    <Assessment className="text-indigo-600" />
                                    Photos Distribution
                                </Typography>
                                <ReactECharts option={options4} style={{ height: '300px' }} />
                            </div>
                        </Card>
                        <Card>
                            <div className="p-4">
                                <Typography variant="h6" gutterBottom className="flex items-center gap-2">
                                    <Assessment className="text-indigo-600" />
                                    Album Size Distribution
                                </Typography>
                                <ReactECharts option={options5} style={{ height: '300px' }} />
                            </div>
                        </Card>
                    </Box>

                    <Card className="mb-4">
                        <div className="p-4">
                            <Typography variant="h6" gutterBottom className="flex items-center gap-2">
                                <Assessment className="text-indigo-600" />
                                Monthly Photo Upload Trends
                            </Typography>
                            <ReactECharts option={options} style={{ height: '300px' }} />
                        </div>
                    </Card>

                    <Card className="mb-4">
                        <div className="p-4">
                            <Typography variant="h6" gutterBottom className="flex items-center gap-2">
                                <Assessment className="text-indigo-600" />
                                Cumulative Growth
                            </Typography>
                            <ReactECharts option={options2} style={{ height: '300px' }} />
                        </div>
                    </Card>

                    <Card>
                        <div className="p-4">
                            <Typography variant="h6" gutterBottom className="flex items-center gap-2">
                                <Assessment className="text-indigo-600" />
                                Growth Rate
                            </Typography>
                            <ReactECharts option={options3} style={{ height: '300px' }} />
                        </div>
                    </Card>
                </>
            ) : (
                <Card className="text-center p-8 bg-gray-50">
                    <Assessment className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No stats available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Start creating albums and uploading photos to see your statistics
                    </Typography>
                </Card>
            )}
        </div>
    );
};
