import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export const PieChartComponent = ({data})=>{

    return(
<ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#82ca9d"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#8884d8', '#8dd1e1'][index % 2]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
    )
}