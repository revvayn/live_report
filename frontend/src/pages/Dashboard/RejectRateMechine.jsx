import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/axios";

import {
  BarChart,
  Bar,
  Cell,
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-gray-600">
                <th className="px-4 py-3 text-left font-semibold">
                  Group Reject
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  Target
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  CEK
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Reject
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  Bulan
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Avg CEK
                </th>
                <th className="px-4 py-3 text-right font-semibold">
                  Avg Reject
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  % Reject
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((r, i) => {
                const target = r.group === "Finish Good" ? 9 : 5;
                const isOver = r.reject_rate > target;

                return (
                  <tr
                    key={i}
                    className={`border-t transition
                ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}
                hover:bg-blue-50/40`}
                  >
                    {/* Group */}
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {r.group}
                    </td>

                    {/* Target */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {target}%
                      </span>
                    </td>

                    {/* CEK */}
                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {r.cek.toLocaleString()}
                    </td>

                    {/* Reject */}
                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {r.reject.toLocaleString()}
                    </td>

                    {/* Bulan */}
                    <td className="px-4 py-3 text-center text-gray-600">
                      {r.bulan}
                    </td>

                    {/* Avg CEK */}
                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {r.avg_cek.toLocaleString()}
                    </td>

                    {/* Avg Reject */}
                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {r.avg_reject.toLocaleString()}
                    </td>

                    {/* Reject Rate */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold
                    ${isOver
                            ? "bg-red-100 text-red-600"
                            : "bg-emerald-100 text-emerald-600"
                          }`}
                      >
                        {r.reject_rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* ================= CHART ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-5">
          <h3 className="font-semibold text-gray-800">
            Reject Percentage
          </h3>
          <p className="text-xs text-gray-400">
            Persentase reject per group (%)
          </p>
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 40, left: 130, bottom: 10 }}
            barCategoryGap={14}
          >
            {/* GRID */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            {/* X AXIS */}
            <XAxis
              type="number"
              domain={[0, "dataMax + 2"]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />

            {/* Y AXIS */}
            <YAxis
              type="category"
              dataKey="group"
              tick={{ fontSize: 13, fill: "#374151" }}
              axisLine={false}
              tickLine={false}
              width={120}
            />

            {/* TOOLTIP */}
            <Tooltip
              cursor={{ fill: "rgba(59,130,246,0.08)" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
              formatter={(v) => [`${v}%`, "Reject Rate"]}
            />

            {/* BAR */}
            <Bar
              dataKey="reject_rate"
              radius={[0, 8, 8, 0]}
              barSize={28}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.reject_rate > 9
                      ? "#ef4444"   // red-500
                      : "#2563eb"   // blue-600
                  }
                />
              ))}

              {/* LABEL */}
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
