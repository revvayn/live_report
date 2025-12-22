import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import DashboardLayout from "../pages/Dashboard/DashboardLayout";
import EntryReject from "../pages/Dashboard/EntryReject";
import RejectRate from "../pages/Dashboard/RejectRate";
import Profile from "../pages/Dashboard/Profile";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/entry-reject" element={<EntryReject />} />
        <Route path="/reject-rate/machine" element={<RejectRate />} />
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
