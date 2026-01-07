import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function BBPerforma() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await api.get(
      "/grpo-report/kedatangan-grader?tahun=2025&bulan=8"
    );
    setData(res.data);
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h3 className="text-center font-bold mb-3">
        KEDATANGAN AUGUST 2025
      </h3>

      <table className="table table-bordered text-sm">
        <thead>
          <tr>
            <th rowSpan="2">No</th>
            <th rowSpan="2">Nama Grader</th>

            <th colSpan="3">LOG 5F</th>
            <th colSpan="3">LOG 9F</th>

            <th colSpan="2">Total</th>
            <th rowSpan="2">Rank</th>

            <th colSpan="3">Jenis Kayu</th>
          </tr>
          <tr>
            <th>Pcs</th>
            <th>Vol</th>
            <th>Avg Dia</th>

            <th>Pcs</th>
            <th>Vol</th>
            <th>Avg Dia</th>

            <th>Pcs</th>
            <th>Vol</th>

            <th>Jabon</th>
            <th>Albasia</th>
            <th>Mahoni</th>
          </tr>
        </thead>

        <tbody>
          {data.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{r.nama_grader}</td>

              <td>{r.log5_pcs}</td>
              <td>{r.log5_vol}</td>
              <td>{r.log5_avg_dia}</td>

              <td>{r.log9_pcs}</td>
              <td>{r.log9_vol}</td>
              <td>{r.log9_avg_dia}</td>

              <td>{r.total_pcs}</td>
              <td>{r.total_vol}</td>

              <td className="fw-bold text-center">{r.rank}</td>

              <td>{r.jabon}</td>
              <td>{r.albasia}</td>
              <td>{r.mahoni}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
