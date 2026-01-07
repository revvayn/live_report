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
        const res = await api.get("/grpo-report/kedatangan-grader", {
            params: {
                tahun: 2025,
                bulan: "Jul-2025", // HARUS STRING SESUAI DB
            },
        });
        setData(res.data);
        setLoading(false);
    };



    if (loading) return <p>Loading...</p>;

    return (
        <div className="container-fluid p-4">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white text-center border-0">
                    <h4 className="fw-bold mb-0">KEDATANGAN AUGUST 2025</h4>
                    <small className="text-muted">Performa Grader Berdasarkan GRPO</small>
                </div>

                <div className="table-responsive">
                    <table className="table table-sm table-hover table-bordered align-middle mb-0">
                        <thead className="table-light text-center sticky-top">
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
                                <th>Avg Ø</th>

                                <th>Pcs</th>
                                <th>Vol</th>
                                <th>Avg Ø</th>

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
                                    <td className="text-center">{i + 1}</td>
                                    <td className="fw-semibold">{r.nama_grader}</td>

                                    <td className="text-end">{r.log5_pcs}</td>
                                    <td className="text-end">{Number(r.log5_vol).toFixed(2)}</td>
                                    <td className="text-end">{r.log5_avg_dia}</td>

                                    <td className="text-end">{r.log9_pcs}</td>
                                    <td className="text-end">{Number(r.log9_vol).toFixed(2)}</td>
                                    <td className="text-end">{r.log9_avg_dia}</td>

                                    <td className="text-end fw-semibold">{r.total_pcs}</td>
                                    <td className="text-end fw-semibold">
                                        {Number(r.total_vol).toFixed(2)}
                                    </td>

                                    <td className="text-center">
                                        <span className="badge bg-primary">{r.rank}</span>
                                    </td>

                                    <td className="text-end">{Number(r.jabon).toFixed(2)}</td>
                                    <td className="text-end">{Number(r.albasia).toFixed(2)}</td>
                                    <td className="text-end">{Number(r.mahoni).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    );
}
