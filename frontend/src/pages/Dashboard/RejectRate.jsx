import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function RejectRate() {
  const { user } = useOutletContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/reject-rate/reject-by-machine")
      .then((res) => setData(res.data))
      .catch(() => alert("Gagal load data"))
      .finally(() => setLoading(false));
  }, []);

  if (!user || loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Reject Rate by Machine
        </h1>
        <p className="text-sm text-gray-500">
          Rekap reject produksi berdasarkan mesin / proses
        </p>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="border px-3 py-2 text-left">Group Reject</th>
              <th className="border px-3 py-2 text-center">Target</th>
              <th className="border px-3 py-2 text-right">CEK</th>
              <th className="border px-3 py-2 text-right">Reject</th>
              <th className="border px-3 py-2 text-center">Bulan</th>
              <th className="border px-3 py-2 text-right">Avg CEK</th>
              <th className="border px-3 py-2 text-right">Avg Reject</th>
              <th className="border px-3 py-2 text-center">% Reject</th>
            </tr>
          </thead>

          <tbody>
            {data.map((r, i) => {
              const target = r.group === "Finish Good" ? 9 : 5;
              const isOver = r.reject_rate > target;

              return (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition text-gray-700"
                >
                  <td className="border px-3 py-2 text-left font-medium">
                    {r.group}
                  </td>

                  <td className="border px-3 py-2 text-center">
                    {target}%
                  </td>

                  <td className="border px-3 py-2 text-right">
                    {r.cek.toLocaleString()}
                  </td>

                  <td className="border px-3 py-2 text-right">
                    {r.reject.toLocaleString()}
                  </td>

                  <td className="border px-3 py-2 text-center">
                    {r.bulan}
                  </td>

                  <td className="border px-3 py-2 text-right">
                    {r.avg_cek.toLocaleString()}
                  </td>

                  <td className="border px-3 py-2 text-right">
                    {r.avg_reject.toLocaleString()}
                  </td>

                  <td
                    className={`border px-3 py-2 text-center font-semibold ${isOver ? "text-red-600" : "text-green-600"
                      }`}
                  >
                    {r.reject_rate}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold text-gray-700 mb-4">
          Reject Percentage (%)
        </h3>

        <ResponsiveContainer width="100%" height={380}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 40, left: 120, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
            />

            <XAxis
              type="number"
              domain={[0, "dataMax + 2"]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              type="category"
              dataKey="group"
              width={110}
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              formatter={(v) => `${v}%`}
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
            />

            <Bar
              dataKey="reject_rate"
              fill="#111827"
              radius={[0, 6, 6, 0]}
              barSize={28}
            >
              <LabelList
                dataKey="reject_rate"
                position="right"
                formatter={(v) => `${v}%`}
                fill="#374151"
                fontSize={12}
                fontWeight={600}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default RejectRate;
