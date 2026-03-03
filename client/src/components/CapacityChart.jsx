import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

/**
 * CapacityChart
 *
 * Renders a side-by-side bar chart comparing Design Capacity vs Full Charge
 * Capacity in mWh.
 *
 * Props:
 *   design {number} — Design Capacity in mWh
 *   actual {number} — Full Charge Capacity in mWh
 */
export default function CapacityChart({ design, actual }) {
  const data = [
    { name: 'Design Capacity', value: design },
    { name: 'Full Charge Capacity', value: actual },
  ];

  // Theme colours from the custom DaisyUI palette
  const COLORS = ['#417b2b', '#4cbf47'];

  const formatMwh = (v) => `${(v / 1000).toFixed(1)} Wh`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="font-heading font-bold text-xl text-primary mb-4 text-center">
        Capacity Breakdown
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#303913" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#c2d88e', fontFamily: 'Lilex, monospace', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatMwh}
            tick={{ fill: '#c2d88e', fontFamily: 'Lilex, monospace', fontSize: 11 }}
            width={70}
          />
          <Tooltip
            formatter={(value) => [`${value.toLocaleString()} mWh`, 'Capacity']}
            contentStyle={{
              backgroundColor: '#141808',
              border: '1px solid #417b2b',
              borderRadius: '8px',
              fontFamily: 'Lilex, monospace',
              color: '#c2d88e',
              
            }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'Lilex, monospace',
              color: '#c2d88e',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="value" name="mWh" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
