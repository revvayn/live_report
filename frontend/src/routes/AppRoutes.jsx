import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import DashboardLayout from "../pages/Dashboard/DashboardLayout";
import EntryReject from "../pages/Dashboard/EntryReject";
import RejectRateMechine from "../pages/Dashboard/RejectRateMechine";
import RejectRateFG from "../pages/Dashboard/RejectRateFG";
import RejectRateFI from "../pages/Dashboard/RejectRateFI";
import RejectRateHotpress from "../pages/Dashboard/RejectRateHotpress";
import RejectRateBlowdetector from "../pages/Dashboard/RejectRateBlowdetector";
import RejectRateSanding from "../pages/Dashboard/RejectRateSanding";
import Profile from "../pages/Dashboard/Profile";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/entry-reject" element={<EntryReject />} />
        <Route path="/reject-rate/machine" element={<RejectRateMechine />} />
        <Route path="/reject-rate/qc-grading-fg" element={<RejectRateFG />} />
        <Route path="/reject-rate/qc-grading-fi" element={<RejectRateFI />} />
        <Route path="/reject-rate/hotpress" element={<RejectRateHotpress />} />
        <Route path="/reject-rate/blow-detector" element={<RejectRateBlowdetector />} />
        <Route path="/reject-rate/sanding" element={<RejectRateSanding />} />
        <Route path="/profile" element={<Profile />} />

        <Route element={<ProtectedRoute allowedRoles={["Counter"]} />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Profile"]} />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default AppRoutes;
