import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import api from "../../api/axios";

export default function EntryGRPO() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPage: 1 });

  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  /* =============================
     FETCH DATA
  ============================== */
  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/entry-bahanbaku", {
        params: { page, limit: 10, search },
      });

      if (res.data.success) {
        setData(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =============================
     CLEAR DATA
  ============================== */
  const handleClearData = async () => {
    if (!window.confirm("Yakin hapus SEMUA data GRPO?")) return;

    try {
      const res = await api.delete("/entry-bahanbaku/clear");
      alert(res.data.message);
      fetchData();
    } catch {
      alert("Gagal menghapus data");
    }
  };

  /* =============================
     IMPORT EXCEL
  ============================== */
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const payload = rows.map((r) => ({
          tgl_grpo: r["Tgl GRPO"],
          tahun: r["Tahun"],
          bulan: r["Bulan"],
          entry_grpo: r["Entry GRPO"],
          no_grpo: r["No.GRPO"],
          no_inv_sim: r["No.Inv Sim"],
          no_tally: r["No.Tally"],
          no_ref_po: r["No.Ref.PO"],
          no_kedatangan: r["No.Kedatangan"],
          no_surat_jalan_vendor: r["No.Surat Jalan Vendor"],

          kode_vendor: r["Kode Vendor"],
          nama_vendor: r["Nama Vendor"],
          rank: r["Rank"],
          group_rotry: r["Group Rotry"],

          kode_item: r["Kode Item"],
          description: r["Description"],

          qty_pcs_grpo: Number(r["Qty Pcs GRPO"]) || 0,
          qty_grpo: Number(String(r["Qty GRPO"]).replace(",", ".")) || 0,
          price_m3: Number(String(r["Price/m3"]).replace(",", ".")) || 0,
          total_price_grpo:
            Number(String(r["Total Price GRPO"]).replace(",", ".")) || 0,

          whs: r["Whs"],
          status_grpo: r["Status GRPO"],
          kota_asal: r["Kota Asal"],
          asal_barang: r["Asal Barang"],

          slpcode: r["SlpCode"],
          nama_grader: r["Nama Grader"],
          diameter: r["Diameter"],
          jenis_kayu: r["Jenis Kayu"],
          group_kayu: r["gROUP"],
          total_dia: r["Total dia"],
          code: r["CODE"],
        }));

        await api.post("/entry-bahanbaku/import", payload);
        alert("Import GRPO berhasil");
        setPage(1);
        fetchData();
        e.target.value = "";
      } catch (err) {
        alert("Import gagal");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  /* =============================
     RENDER
  ============================== */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Entry GRPO</h1>
        <p className="text-gray-500">Import & kelola data GRPO</p>
      </div>

      {/* ACTION BAR */}
      <div className="bg-white p-4 rounded-2xl shadow flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleImport}
            hidden
            id="file"
          />
          <label
            htmlFor="file"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition"
          >
            📤 Import Excel
          </label>

          <button
            onClick={handleClearData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            🗑 Clear Data
          </button>
        </div>

        {loading && (
          <span className="text-blue-600 text-sm font-medium animate-pulse">
            Processing...
          </span>
        )}
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Cari GRPO / Vendor / Item..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-80 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">No GRPO</th>
                <th className="px-4 py-3 text-left">Vendor</th>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Total Price</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                data.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{d.no_grpo}</td>
                    <td className="px-4 py-3">{d.nama_vendor}</td>
                    <td className="px-4 py-3">{d.description}</td>
                    <td className="px-4 py-3 text-right">{d.qty_grpo}</td>
                    <td className="px-4 py-3 text-right">
                      {Number(d.total_price_grpo).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{d.status_grpo}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => {
                          setSelected(d);
                          setShowDetail(true);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm">
          Page {page} of {pagination.totalPage}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded disabled:opacity-40"
          >
            ◀ Prev
          </button>
          <button
            disabled={page >= pagination.totalPage}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded disabled:opacity-40"
          >
            Next ▶
          </button>
        </div>
      </div>

      {showDetail && selected && (
        <DetailModal data={selected} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
}

/* =============================
   DETAIL MODAL
============================= */
function DetailModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Detail GRPO #{data.no_grpo}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Detail label="Vendor" value={data.nama_vendor} />
          <Detail label="Item" value={data.description} />
          <Detail label="Qty GRPO" value={data.qty_grpo} />
          <Detail label="Price/m3" value={data.price_m3} />
          <Detail label="Total Price" value={data.total_price_grpo} />
          <Detail label="Whs" value={data.whs} />
          <Detail label="Kota Asal" value={data.kota_asal} />
          <Detail label="Jenis Kayu" value={data.jenis_kayu} />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value || "-"}</p>
    </div>
  );
}
