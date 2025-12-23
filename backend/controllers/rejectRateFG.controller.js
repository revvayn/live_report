const pool = require("../db");

exports.getRejectRateFG = async (req, res) => {
  try {
    // ================= KPI =================
    const kpiQuery = `
      SELECT
        SUM(valid_qty_pcs) AS cek,
        SUM(reject_pcs) AS reject,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs),0) * 100,
          1
        ) AS reject_rate
      FROM production_reports
      WHERE workcenter ILIKE '%GRADING%'
    `;

    // ================= PER HARI =================
    const perHariQuery = `
      SELECT
        doc_date,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs),0) * 100,
          1
        ) AS reject_rate
      FROM production_reports
      WHERE workcenter = 'GRADING_FG'
      GROUP BY doc_date
      ORDER BY doc_date
    `;

    // ================= PER SHIFT =================
    const perShiftQuery = `
      SELECT
        shift,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs),0) * 100,
          1
        ) AS reject_rate
      FROM production_reports
      WHERE workcenter = 'GRADING_FG'
      GROUP BY shift
      ORDER BY shift
    `;

    // ================= PER KATEGORI =================
    const kategoriQuery = `
      SELECT
        kategori,
        SUM(reject_pcs) AS reject
      FROM production_reports
      WHERE workcenter = 'GRADING_FG'
      GROUP BY kategori
      ORDER BY reject DESC
    `;

    // ================= TOP BUYER =================
    const buyerQuery = `
      SELECT
        buyer_name,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs),0) * 100,
          1
        ) AS reject_rate
      FROM production_reports
      WHERE workcenter = 'GRADING_FG'
      GROUP BY buyer_name
      ORDER BY reject_rate DESC
      LIMIT 3
    `;

    // ================= DETAIL =================
    const detailQuery = `
      SELECT
        EXTRACT(YEAR FROM doc_date) AS tahun,
        TO_CHAR(doc_date,'Month') AS bulan,
        TO_CHAR(doc_date,'DD') AS tgl,
        shift,
        workcenter AS mesin,
        SUM(valid_qty_pcs) AS produk_dicek,
        SUM(reject_pcs) AS pcs_reject,
        ROUND(
          SUM(reject_pcs)::numeric
          / NULLIF(SUM(valid_qty_pcs),0) * 100,
          1
        ) AS reject_rate
      FROM production_reports
      WHERE workcenter = 'GRADING_FG'
      GROUP BY doc_date, shift, workcenter
      ORDER BY doc_date DESC
    `;

    const [
      kpi,
      perHari,
      perShift,
      kategori,
      topBuyer,
      detail,
    ] = await Promise.all([
      pool.query(kpiQuery),
      pool.query(perHariQuery),
      pool.query(perShiftQuery),
      pool.query(kategoriQuery),
      pool.query(buyerQuery),
      pool.query(detailQuery),
    ]);

    res.json({
      kpi: kpi.rows[0],
      perHari: perHari.rows,
      perShift: perShift.rows,
      kategori: kategori.rows,
      topBuyer: topBuyer.rows,
      detail: detail.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data reject FG" });
  }
};
