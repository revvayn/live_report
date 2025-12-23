const pool = require("../db");

/* =====================================================
   GET ALL + SEARCH + PAGINATION
===================================================== */
exports.getAll = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Belum login" });
  }

  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const offset = (page - 1) * limit;

    const where = search
      ? `
        WHERE
          production_no ILIKE $1 OR
          sales_order_no ILIKE $1 OR
          buyer_name ILIKE $1 OR
          item_code ILIKE $1 OR
          item_description ILIKE $1 OR
          mesin ILIKE $1 OR
          operator_name ILIKE $1
      `
      : "";

    const params = search ? [`%${search}%`] : [];

    /* TOTAL */
    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM production_reports ${where}`,
      params
    );

    const totalData = Number(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / limit);

    /* DATA */
    const dataResult = await pool.query(
      `
      SELECT *
      FROM production_reports
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
      `,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: { page, limit, totalData, totalPage },
    });
  } catch (err) {
    console.error("GET ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =====================================================
   CREATE MANUAL (OPTIONAL)
===================================================== */
exports.create = async (req, res) => {
  try {
    const {
      production_no,
      sales_order_no,
      buyer_code,
      buyer_name,
      item_code,
      item_description,
      reject_pcs = 0,
      reject_volume = 0,
    } = req.body;

    await pool.query(
      `
      INSERT INTO production_reports
      (production_no, sales_order_no, buyer_code, buyer_name,
       item_code, item_description, reject_pcs, reject_volume)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        production_no,
        sales_order_no,
        buyer_code,
        buyer_name,
        item_code,
        item_description,
        reject_pcs,
        reject_volume,
      ]
    );

    res.json({ success: true, message: "Data berhasil ditambahkan" });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal input data" });
  }
};

/* =====================================================
   IMPORT EXCEL (FRONTEND SEND JSON ARRAY)
===================================================== */
exports.importExcel = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Belum login" });
  }

  const client = await pool.connect();

  try {
    const rows = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data kosong atau format tidak valid",
      });
    }

    await client.query("BEGIN");

    const sql = `
      INSERT INTO production_reports (
        production_no, status_po, sales_order_no, buyer_code, buyer_name,
        status_so, so_cancel, checkin_no, checkout_no, doc_date, bulan, shift,
        operator_name, koordinator, no_proses, workcenter, kategori,
        item_code, item_description, vol_per_pcs, mesin, route, workcenter2,
        input_pcs, input_volume, output_pcs, output_volume,
        valid_qty_pcs, valid_qty, reject_pcs, reject_volume, unit_mesin
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,$11,$12,
        $13,$14,$15,$16,$17,
        $18,$19,$20,$21,$22,$23,
        $24,$25,$26,$27,
        $28,$29,$30,$31,$32
      )
    `;

    for (const r of rows) {
      await client.query(sql, [
        r.production_no,
        r.status_po || null,
        r.sales_order_no,
        r.buyer_code,
        r.buyer_name,
        r.status_so || null,
        r.so_cancel === true || r.so_cancel === "Y",
        r.checkin_no || null,
        r.checkout_no || null,
        r.doc_date || null,
        r.bulan || null,
        r.shift || null,
        r.operator_name || null,
        r.koordinator || null,
        r.no_proses || null,
        r.workcenter || null,
        r.kategori || null,
        r.item_code,
        r.item_description,
        Number(String(r.vol_per_pcs || 0).replace(",", ".")),
        r.mesin || null,
        r.route || null,
        r.workcenter2 || null,
        Number(r.input_pcs || 0),
        Number(String(r.input_volume || 0).replace(",", ".")),
        Number(r.output_pcs || 0),
        Number(String(r.output_volume || 0).replace(",", ".")),
        Number(r.valid_qty_pcs || 0),
        Number(String(r.valid_qty || 0).replace(",", ".")),
        Number(r.reject_pcs || 0),
        Number(String(r.reject_volume || 0).replace(",", ".")),
        r.unit_mesin || null,
      ]);
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: `Import berhasil (${rows.length} data)`,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal import data" });
  } finally {
    client.release();
  }
};

/* =====================================================
   CLEAR ALL
===================================================== */
exports.clearAll = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: "Belum login" });
  }

  try {
    await pool.query("TRUNCATE production_reports RESTART IDENTITY CASCADE");
    res.json({ success: true, message: "Semua data berhasil dihapus" });
  } catch (err) {
    console.error("CLEAR ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus data" });
  }
};
