import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import EventsListPage from "./pages/events/EventsListPage";
import EventDetailPage from "./pages/events/EventDetailPage";
import OrderConfirmationPage from "./pages/checkout/OrderConfirmationPage";
import MyTicketsPage from "./pages/tickets/MyTicketsPage";
import ValidateTicketPage from "./pages/admin/ValidateTicketPage";
import AdminEventsListPage from "./pages/admin/AdminEventsListPage";
import EventFormPage from "./pages/admin/EventFormPage";
import AdminEventDetailPage from "./pages/admin/AdminEventDetailPage";
import StaffPage from "./pages/admin/StaffPage";
import AccountPage from "./pages/account/AccountPage";
import TermsPage from "./pages/legal/TermsPage";
import PrivacyPage from "./pages/legal/PrivacyPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/eventos" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
        <Route path="/eventos" element={<EventsListPage />} />
        <Route path="/eventos/:id" element={<EventDetailPage />} />
        <Route path="/termosecondicoes" element={<TermsPage />} />
        <Route path="/politicadeprivacidade" element={<PrivacyPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/pedidos/:id" element={<OrderConfirmationPage />} />
          <Route path="/meus-ingressos" element={<MyTicketsPage />} />
          <Route path="/conta" element={<AccountPage />} />
        </Route>

        <Route element={<RequireAuth roles={["Administrador", "Validador"]} />}>
          <Route path="/admin/validar" element={<ValidateTicketPage />} />
        </Route>

        <Route element={<RequireAuth roles={["Administrador"]} />}>
          <Route path="/admin/eventos" element={<AdminEventsListPage />} />
          <Route path="/admin/eventos/novo" element={<EventFormPage />} />
          <Route path="/admin/eventos/:id" element={<AdminEventDetailPage />} />
          <Route path="/admin/eventos/:id/editar" element={<EventFormPage />} />
          <Route path="/admin/funcionarios" element={<StaffPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
