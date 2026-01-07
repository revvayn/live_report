const pool = require("../config/db");

const getKedatanganGrader = async (req, res) => {
  try {
    let { tahun, bulan } = req.query;

    tahun = tahun ? parseInt(tahun) : null;
    bulan = bulan ? parseInt(bulan) : null;

    const sql = `
      SELECT
        nama_grader,

        -- LOG 5F
        COALESCE(SUM(CASE WHEN group_kayu = 'LOG 5F' THEN qty_pcs_grpo END), 0) AS log5_pcs,
        COALESCE(SUM(CASE WHEN group_kayu = 'LOG 5F' THEN qty_grpo END), 0) AS log5_vol,
        ROUND(AVG(CASE WHEN group_kayu = 'LOG 5F' THEN diameter END), 2) AS log5_avg_dia,

        -- LOG 9F
        COALESCE(SUM(CASE WHEN group_kayu = 'LOG 9F' THEN qty_pcs_grpo END), 0) AS log9_pcs,
        COALESCE(SUM(CASE WHEN group_kayu = 'LOG 9F' THEN qty_grpo END), 0) AS log9_vol,
        ROUND(AVG(CASE WHEN group_kayu = 'LOG 9F' THEN diameter END), 2) AS log9_avg_dia,

        -- TOTAL
        COALESCE(SUM(qty_pcs_grpo), 0) AS total_pcs,
        COALESCE(SUM(qty_grpo), 0) AS total_vol

      FROM grpo_reports
      WHERE
        ($1 IS NULL OR CAST(tahun AS INTEGER) = $1)
        AND ($2 IS NULL OR CAST(bulan AS INTEGER) = $2)
      GROUP BY nama_grader
      ORDER BY total_vol DESC
    `;

    const { rows } = await pool.query(sql, [tahun, bulan]);

    res.json(rows);
  } catch (error) {
    console.error("BB Performa Error:", error);
    res.status(500).json({ message: "Gagal ambil BB Performa" });
  }
};

module.exports = {
  getKedatanganGrader,
};
