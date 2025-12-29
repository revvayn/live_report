import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import Swal from "sweetalert2";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  /* ================= LOGOUT ================= */
  const logout = async () => {
    const confirm = await Swal.fire({
      title: "Logout?",
      text: "Anda akan keluar dari sistem",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.post("/auth/logout");
      navigate("/");
    } catch {
      Swal.fire("Error", "Gagal logout", "error");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-lg">
        {/* BRAND */}
        <div className="px-6 py-5 border-b border-gray-800">
          <h1 className="text-lg font-bold tracking-wide">
            Live Report System
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            PT. Bahana Bhumiphala Persada
          </p>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
          <MenuLink to="/dashboard" label="Dashboard" />
          <MenuLink to="/entry-reject" label="Entry Reject" />
          {/* Dropdown Reject Rate */}
          <RejectRateDropdown />
          <MenuLink to="/profile" label="Profil" />
        </nav>

        {/* USER INFO */}
        <div className="px-6 py-4 border-t border-gray-800">
          <p className="text-sm font-semibold">
            {user?.nama_lengkap || user?.username}
          </p>
          <p className="text-xs text-gray-400 mb-3">Akun Pengguna</p>

          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 transition px-3 py-2 rounded text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

/* ================= MENU ITEM ================= */
function MenuLink({ to, label }) {
  return (
    <Link
      to={to}
      className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
    >
      {label}
    </Link>
  );
}

function RejectRateDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition flex justify-between items-center"
      >
        <span>Reject Rate</span>
        <span className="text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-1 space-y-1">
          <SubMenuLink to="/reject-rate/machine" label="Machine" />
          <SubMenuLink to="/reject-rate/qc-grading-fg" label="QC Grading FG" />
          <SubMenuLink to="/reject-rate/qc-grading-fi" label="QC Grading FI" />
          <SubMenuLink to="/reject-rate/hotpress" label="Hotpress" />
          <SubMenuLink to="/reject-rate/blow-detector" label="Blow Detector" />
          <SubMenuLink to="/reject-rate/sanding" label="Sanding" />
          <SubMenuLink to="/reject-rate/grading-fg" label="Grading FG" />
          <SubMenuLink to="/reject-rate/grading-fi" label="Grading FI" />
        </div>
      )}
    </div>
  );
}

function SubMenuLink({ to, label }) {
  return (
    <Link
      to={to}
      className="block pl-8 pr-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm"
    >
      {label}
    </Link>
  );
}

