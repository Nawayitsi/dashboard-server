import { ResponsiveContainer, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface DataPoint {
  time: string;
  [key: string]: any;
}

interface AreaChartProps {
  data: DataPoint[];
  dataKey: string;
  strokeColor?: string;
  fillColor?: string;
  height?: number;
}

export function AreaChart({
  data,
  dataKey,
  strokeColor = '#4F8CFF',
  fillColor = 'rgba(79, 140, 255, 0.15)',
  height = 200,
}: AreaChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="rgba(255, 255, 255, 0.3)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(str) => {
              try {
                const date = new Date(str);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } catch {
                return str;
              }
            }}
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
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
            labelFormatter={(label) => {
              try {
                return new Date(label).toLocaleString();
              } catch {
                return label;
              }
            }}
          />
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={strokeColor} 
            strokeWidth={2}
            fill={`url(#grad-${dataKey})`} 
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
