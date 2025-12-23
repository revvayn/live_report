const pool = require("../db");

exports.getRejectByMachine = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        workcenter,
        COUNT(DISTINCT NULLIF(bulan, '')) AS bulan,
        SUM(valid_qty_pcs) AS cek,
        SUM(reject_pcs) AS reject,
        ROUND(
          (SUM(reject_pcs)::decimal / NULLIF(SUM(valid_qty_pcs), 0)) * 100,
          1
        ) AS reject_rate
      FROM production_reports
      WHERE workcenter IS NOT NULL
      GROUP BY workcenter
      ORDER BY reject_rate DESC
    `);

    const data = result.rows.map(r => ({
      group: r.workcenter,
      bulan: Number(r.bulan) || 0,
      cek: Number(r.cek) || 0,
      reject: Number(r.reject) || 0,
      avg_cek: r.bulan ? Math.round(r.cek / r.bulan) : 0,
      avg_reject: r.bulan ? Math.round(r.reject / r.bulan) : 0,
      reject_rate: Number(r.reject_rate) || 0
    }));

    res.json(data);
  } catch (err) {
    console.error("RejectRate Error:", err);
    res.status(500).json({ message: "Gagal mengambil reject rate" });
  }
};
