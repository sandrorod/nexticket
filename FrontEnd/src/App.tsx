import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import EventsListPage from "./pages/events/EventsListPage";
import EventDetailPage from "./pages/events/EventDetailPage";
import OrderConfirmationPage from "./pages/checkout/OrderConfirmationPage";
import MyTicketsPage from "./pages/tickets/MyTicketsPage";
import ValidateTicketPage from "./pages/admin/ValidateTicketPage";
import AdminEventsListPage from "./pages/admin/AdminEventsListPage";
import EventFormPage from "./pages/admin/EventFormPage";
import AdminEventDetailPage from "./pages/admin/AdminEventDetailPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/eventos" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/eventos" element={<EventsListPage />} />
        <Route path="/eventos/:id" element={<EventDetailPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/pedidos/:id" element={<OrderConfirmationPage />} />
          <Route path="/meus-ingressos" element={<MyTicketsPage />} />
        </Route>

        <Route element={<RequireAuth role="Administrador" />}>
          <Route path="/admin/validar" element={<ValidateTicketPage />} />
          <Route path="/admin/eventos" element={<AdminEventsListPage />} />
          <Route path="/admin/eventos/novo" element={<EventFormPage />} />
          <Route path="/admin/eventos/:id" element={<AdminEventDetailPage />} />
          <Route path="/admin/eventos/:id/editar" element={<EventFormPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
