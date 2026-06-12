import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface BarChartProps {
  data: any[];
  dataKey: string;
  color?: string;
  height?: number;
}

export function BarChart({
  data,
  dataKey,
  color = '#4F8CFF',
  height = 200,
}: BarChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
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
          <Bar 
            dataKey={dataKey} 
            fill={color} 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
