import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import PrivateRoutes from "./modules/PrivateRoutes";
import PublicRoutes from "./modules/PublicRoutes"; // Import the new PublicRoutes component
import Settings from "./pages/settings/Settings";
import NotFound from "./modules/NotFound";
import "./App.css";

function App() {
  return (
    <div className="App min-h-screen">
      <BrowserRouter>
        <Routes>
          {/* Protected Routes  */}
          <Route element={<PrivateRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Public Auth Routes  */}
          <Route element={<PublicRoutes />}>
            <Route path="/auth">
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="verify-email" element={<VerifyEmail />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
            </Route>
          </Route>

          {/* Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
