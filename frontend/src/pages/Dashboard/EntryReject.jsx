import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import api from "../../api/axios";

export default function EntryReject() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPage: 1 });

    const [selected, setSelected] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    // =============================
    // FETCH DATA
    // =============================
    const fetchData = useCallback(async () => {
        try {
            const res = await api.get("/entry-reject", {
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

    // =============================
    // CLEAR DATA
    // =============================
    const handleClearData = async () => {
        if (!window.confirm("Yakin hapus SEMUA data?")) return;

        try {
            const res = await api.delete("/entry-reject/clear");
            alert(res.data.message);
            fetchData();
        } catch {
            alert("Gagal menghapus data");
        }
    };

    // =============================
    // IMPORT EXCEL
    // =============================
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
                    production_no: r["Production No"],
                    status_po: r["Status PO"],
                    sales_order_no: r["Sales Order No"],
                    buyer_code: r["Buyer Code"],
                    buyer_name: r["Buyer Name"],

                    status_so: r["Status SO"],
                    so_cancel: r["SO Cancel"] === "Y",

                    checkin_no: r["CheckIn No"],
                    checkout_no: r["CheckOut No"],
                    doc_date: r["Doc Date"],
                    bulan: r["Bulan"],
                    shift: r["Shift"],

                    operator_name: r["Operator Name"],
                    koordinator: r["Koordinator"],
                    no_proses: r["No Proses"],
                    workcenter: r["Workcenter"],
                    kategori: r["Kategori"],

                    item_code: r["Item Code"],
                    item_description: r["Item Description"],
                    vol_per_pcs: Number(String(r["Vol/pcs"]).replace(",", ".")),

                    mesin: r["Mesin"],
                    route: r["Route"],
                    workcenter2: r["Workcenter2"],
                    status_check_out: r["Status Check OUT"],

                    input_pcs: Number(r["Input Pcs"]) || 0,
                    input_volume: Number(String(r["Input Volume"]).replace(",", ".")) || 0,

                    output_pcs: Number(r["Output Pcs"]) || 0,
                    output_volume: Number(String(r["Output Volume"]).replace(",", ".")) || 0,

                    valid_qty_pcs: Number(r["Valid Qty Pcs"]) || 0,
                    valid_qty: Number(String(r["Valid Qty"]).replace(",", ".")) || 0,

                    reject_pcs: Number(r["Reject Pcs"]) || 0,
                    reject_volume: Number(String(r["Reject Vol."]).replace(",", ".")) || 0,

                    unit_mesin: r["Unit Mesin"],
                }));



                await api.post("/entry-reject/import", payload);
                alert("Import berhasil");
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

    // =============================
    // RENDER
    // =============================
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Entry Reject</h1>
                <p className="text-gray-500">Kelola data reject produksi</p>
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
                    placeholder="🔍 Cari production / buyer / item..."
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
                        <thead className="bg-gray-100 text-gray-700 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left">Production</th>
                                <th className="px-4 py-3 text-left">SO</th>
                                <th className="px-4 py-3 text-left">Buyer</th>
                                <th className="px-4 py-3 text-left">Item</th>
                                <th className="px-4 py-3 text-left">Workcenter</th>
                                <th className="px-4 py-3 text-center">Reject</th>
                                <th className="px-4 py-3 text-left">Tanggal</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-8 text-center text-gray-400">
                                        Tidak ada data
                                    </td>
                                </tr>
                            ) : (
                                data.map((d, i) => (
                                    <tr
                                        key={d.id}
                                        className={`border-t hover:bg-gray-50 ${i % 2 === 1 ? "bg-gray-50/50" : ""
                                            }`}
                                    >
                                        <td className="px-4 py-3 font-semibold">
                                            {d.production_no}
                                        </td>
                                        <td className="px-4 py-3">{d.sales_order_no}</td>
                                        <td className="px-4 py-3">{d.buyer_name}</td>
                                        <td className="px-4 py-3 truncate max-w-xs">
                                            {d.item_description}
                                        </td>
                                        <td className="px-4 py-3">{d.workcenter}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-red-600">
                                            {d.reject_pcs}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(d.doc_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelected(d);
                                                    setShowDetail(true);
                                                }}
                                                className="text-blue-600 hover:underline font-medium"
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
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
                <span className="text-sm text-gray-600">
                    Page <b>{page}</b> of <b>{pagination.totalPage}</b>
                </span>

                <div className="flex gap-2">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
                    >
                        ◀ Prev
                    </button>
                    <button
                        disabled={page >= pagination.totalPage}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
                    >
                        Next ▶
                    </button>
                </div>
            </div>

            {/* MODAL DETAIL */}
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
            <div className="bg-white rounded-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                        Detail Production #{data.production_no}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-600 text-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* DETAIL GRID */}
                <div className="space-y-6 text-sm">

                    {/* ORDER & BUYER */}
                    <Section title="Order & Buyer">
                        <Detail label="Production No" value={data.production_no} />
                        <Detail label="Sales Order No" value={data.sales_order_no} />
                        <Detail label="Status PO" value={data.status_po} />
                        <Detail label="Status SO" value={data.status_so} />
                        <Detail label="SO Cancel" value={data.so_cancel ? "YES" : "NO"} />
                        <Detail label="Buyer Code" value={data.buyer_code} />
                        <Detail label="Buyer Name" value={data.buyer_name} />
                    </Section>

                    {/* CHECK IN / OUT */}
                    <Section title="Check In / Out">
                        <Detail label="Check In No" value={data.checkin_no} />
                        <Detail label="Check Out No" value={data.checkout_no} />
                        <Detail label="Status Check Out" value={data.status_check_out} />
                        <Detail label="Doc Date" value={data.doc_date && new Date(data.doc_date).toLocaleDateString()} />
                        <Detail label="Bulan" value={data.bulan} />
                        <Detail label="Shift" value={data.shift} />
                    </Section>

                    {/* SDM */}
                    <Section title="SDM">
                        <Detail label="Operator" value={data.operator_name} />
                        <Detail label="Koordinator" value={data.koordinator} />
                    </Section>

                    {/* PROSES */}
                    <Section title="Proses Produksi">
                        <Detail label="No Proses" value={data.no_proses} />
                        <Detail label="Workcenter" value={data.workcenter} />
                        <Detail label="Workcenter 2" value={data.workcenter2} />
                        <Detail label="Kategori" value={data.kategori} />
                        <Detail label="Mesin" value={data.mesin} />
                        <Detail label="Route" value={data.route} />
                        <Detail label="Unit Mesin" value={data.unit_mesin} />
                    </Section>

                    {/* ITEM */}
                    <Section title="Item">
                        <Detail label="Item Code" value={data.item_code} />
                        <Detail label="Item Description" value={data.item_description} />
                        <Detail label="Vol / pcs" value={data.vol_per_pcs} />
                    </Section>

                    {/* QUANTITY */}
                    <Section title="Quantity">
                        <Detail label="Input Pcs" value={data.input_pcs} />
                        <Detail label="Input Volume" value={data.input_volume} />
                        <Detail label="Output Pcs" value={data.output_pcs} />
                        <Detail label="Output Volume" value={data.output_volume} />
                        <Detail label="Valid Qty Pcs" value={data.valid_qty_pcs} />
                        <Detail label="Valid Qty" value={data.valid_qty} />
                        <Detail label="Reject Pcs" value={data.reject_pcs} />
                        <Detail label="Reject Volume" value={data.reject_volume} />
                    </Section>

                </div>



                {/* FOOTER */}
                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
function Section({ title, children }) {
    return (
        <div>
            <h3 className="font-semibold text-gray-700 mb-3 border-b pb-1">
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    );
}
function Detail({ label, value }) {
    return (
        <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className="font-semibold text-gray-800">
                {value !== null && value !== "" ? value : "-"}
            </p>
        </div>
    );
}
