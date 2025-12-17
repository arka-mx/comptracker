
import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const SubmissionGraph = ({ calendarData }) => {
    const { theme } = useTheme();

    if (!calendarData || Object.keys(calendarData).length === 0) {
        return (
            <div className="activity-placeholder">
                No data available for graph
            </div>
        );
    }

    // Process data: Convert timestamp keys to Date objects and sort
    const data = Object.entries(calendarData).map(([timestamp, count]) => {
        const date = new Date(parseInt(timestamp) * 1000); // timestamp is in seconds
        return {
            date: date,
            count: count,
            displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
            fullDate: date.toLocaleDateString()
        };
    }).sort((a, b) => a.date - b.date);

    // Filter to last 3-6 months if needed? For now show all returned

    const isLight = theme === 'light';

    return (
        <div style={{ width: '100%', height: 300, background: isLight ? '#fff' : '#1a1b1f', padding: '20px', borderRadius: '12px', border: `1px solid ${isLight ? '#fed7aa' : '#2d2e33'}` }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffa116" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ffa116" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#eee" : "#333"} />
                    <XAxis
                        dataKey="displayDate"
                        stroke={isLight ? "#666" : "#888"}
                        fontSize={12}
                        interval="preserveStartEnd"
                        minTickGap={30}
                    />
                    <YAxis stroke={isLight ? "#666" : "#888"} fontSize={12} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isLight ? '#fff' : '#25262b',
                            borderColor: isLight ? '#ddd' : '#444',
                            color: isLight ? '#000' : '#fff'
                        }}
                        labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0 && payload[0].payload) {
                                return `Date: ${payload[0].payload.fullDate}`;
                            }
                            return `Date: ${label}`;
                        }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#ffa116" fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SubmissionGraph;
