import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const COLORS = ["#2563eb", "#f97316", "#16a34a", "#eab308", "#9333ea"];

export default function RejectRateFG() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/reject-rate/grading-fg")
      .then(res => {
        console.log("API RESULT:", res.data);
        setData(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  if (!data) return <p>Loading...</p>;

  const totalRejectKategori =
    data.kategori?.reduce((a, b) => a + Number(b.reject || 0), 0) || 0;

  return (
    <div className="space-y-8">

      {/* KPI */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card">Reject Rate<br /><b>{data.kpi.reject_rate}%</b></div>
        <div className="card">Total Cek<br /><b>{data.kpi.cek}</b></div>
        <div className="card">Total Reject<br /><b>{data.kpi.reject}</b></div>
        <div className="card">Total Reject (Kategori)<br /><b>{totalRejectKategori}</b></div>
      </div>

      {/* Reject Per Hari */}
      <div className="bg-white p-4 rounded-xl">
        <h3>Reject Per Hari</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.perHari}>
            <XAxis dataKey="doc_date" />
            <YAxis unit="%" />
            <Tooltip />
            <Line dataKey="reject_rate" stroke="#2563eb" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Reject Per Shift */}
      <div className="bg-white p-4 rounded-xl">
        <h3>Reject Per Shift</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.perShift}>
            <XAxis dataKey="shift" />
            <YAxis unit="%" />
            <Tooltip />
            <Bar dataKey="reject_rate" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Kategori */}
      <div className="bg-white p-4 rounded-xl">
        <h3>% Reject Per Kategori</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.kategori}
              dataKey="reject"
              nameKey="kategori"
              outerRadius={110}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {data.kategori.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
