const pool = require("../db");

/* =====================================================
   HELPER
===================================================== */
const excelDateToJS = (value) => {
  if (!value) return null;

  // sudah string tanggal
  if (typeof value === "string" && value.includes("-")) {
    return value;
  }

  // excel serial number
  if (!isNaN(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + Number(value) * 86400000);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  return null;
};

const toNumber = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  return Number(String(val).replace(",", ".")) || 0;
};

/* =====================================================
   GET ALL + SEARCH + PAGINATION (GRPO)
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
          no_grpo ILIKE $1 OR
          no_ref_po ILIKE $1 OR
          nama_vendor ILIKE $1 OR
          kode_item ILIKE $1 OR
          description ILIKE $1 OR
          jenis_kayu ILIKE $1
      `
      : "";

    const params = search ? [`%${search}%`] : [];

    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM grpo_reports ${where}`,
      params
    );

    const totalData = Number(totalResult.rows[0].count);
    const totalPage = Math.ceil(totalData / limit);

    const dataResult = await pool.query(
      `
      SELECT *
      FROM grpo_reports
      ${where}
      ORDER BY tgl_grpo DESC NULLS LAST
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
    console.error("GET GRPO ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =====================================================
   CREATE MANUAL (GRPO)
===================================================== */
exports.create = async (req, res) => {
  try {
    const {
      tgl_grpo,
      no_grpo,
      kode_vendor,
      nama_vendor,
      kode_item,
      description,
      qty_grpo,
      total_price_grpo,
    } = req.body;

    await pool.query(
      `
      INSERT INTO grpo_reports
      (tgl_grpo, no_grpo, kode_vendor, nama_vendor,
       kode_item, description, qty_grpo, total_price_grpo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        excelDateToJS(tgl_grpo),
        no_grpo,
        kode_vendor,
        nama_vendor,
        kode_item,
        description,
        toNumber(qty_grpo),
        toNumber(total_price_grpo),
      ]
    );

    res.json({ success: true, message: "Data GRPO berhasil ditambahkan" });
  } catch (err) {
    console.error("CREATE GRPO ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal input data" });
  }
};

/* =====================================================
   IMPORT EXCEL (GRPO)
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
      INSERT INTO grpo_reports (
        tgl_grpo, tahun, bulan, entry_grpo, no_grpo,
        no_inv_sim, no_tally, no_ref_po, no_kedatangan, no_surat_jalan_vendor,
        kode_vendor, nama_vendor, rank, group_rotary,
        kode_item, description,
        qty_pcs_grpo, qty_grpo, price_per_m3, total_price_grpo,
        whs, status_grpo,
        kota_asal, asal_barang,
        slpcode, nama_grader,
        diameter, jenis_kayu, group_kayu, total_dia, code
      ) VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,
        $11,$12,$13,$14,
        $15,$16,
        $17,$18,$19,$20,
        $21,$22,
        $23,$24,
        $25,$26,
        $27,$28,$29,$30,$31
      )
    `;

    for (const r of rows) {
      const tgl = excelDateToJS(r.tgl_grpo);

      await client.query(sql, [
        tgl,
        r.tahun || (tgl ? new Date(tgl).getFullYear() : null),
        r.bulan || (tgl ? new Date(tgl).getMonth() + 1 : null),
        r.entry_grpo || null,
        r.no_grpo || null,

        r.no_inv_sim || null,
        r.no_tally || null,
        r.no_ref_po || null,
        r.no_kedatangan || null,
        r.no_surat_jalan_vendor || null,

        r.kode_vendor || null,
        r.nama_vendor || null,
        r.rank || null,
        r.group_rotary || null,

        r.kode_item || null,
        r.description || null,

        toNumber(r.qty_pcs_grpo),
        toNumber(r.qty_grpo),
        toNumber(r.price_per_m3),
        toNumber(r.total_price_grpo),

        r.whs || null,
        r.status_grpo || null,

        r.kota_asal || null,
        r.asal_barang || null,

        r.slpcode || null,
        r.nama_grader || null,

        toNumber(r.diameter),
        r.jenis_kayu || null,
        r.group_kayu || null,
        toNumber(r.total_dia),
        r.code || null,
      ]);
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: `Import GRPO berhasil (${rows.length} data)`,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("IMPORT GRPO ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal import data GRPO" });
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
    await pool.query("TRUNCATE grpo_reports RESTART IDENTITY CASCADE");
    res.json({ success: true, message: "Semua data GRPO berhasil dihapus" });
  } catch (err) {
    console.error("CLEAR GRPO ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus data" });
  }
};

