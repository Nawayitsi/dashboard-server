import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface LineChartProps {
  data: any[];
  dataKey: string;
  strokeColor?: string;
  height?: number;
}

export function LineChart({
  data,
  dataKey,
  strokeColor = '#7A5CFF',
  height = 200,
}: LineChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255, 255, 255, 0.3)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.3)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(11, 13, 16, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'white',
            }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={strokeColor} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
