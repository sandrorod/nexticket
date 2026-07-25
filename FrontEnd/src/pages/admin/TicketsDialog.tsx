import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Chip, Divider,
  CircularProgress, IconButton, Button, Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadIcon from "@mui/icons-material/Download";
import jsPDF from "jspdf";
import { getTicketsByEvent, cancelTicket } from "../../api/events";
import { formatarDataHora } from "../../utils/date";
import type { TicketDto } from "../../types";

const contentFontSize = "0.7875rem";

function formatarValor(valor: number | null) {
  return valor === null || valor === undefined ? "-" : `R$ ${valor.toFixed(2)}`;
}

function TicketRow({
  ticket,
  isMobile,
  onCancel,
  canceling,
}: {
  ticket: TicketDto;
  isMobile: boolean;
  onCancel: (ticket: TicketDto) => void;
  canceling: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cancelado = ticket.status === "Cancelado";

  const cancelButton = (
    <Tooltip title={cancelado ? "Ingresso já cancelado" : "Excluir ingresso"}>
      <span>
        <IconButton
          size="small"
          disabled={cancelado || canceling}
          onClick={(e) => {
            e.stopPropagation();
            onCancel(ticket);
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );

  if (isMobile) {
    return (
      <Box
        onClick={() => setExpanded((e) => !e)}
        sx={{ py: 1, px: 1, borderRadius: "0.5rem", cursor: "pointer", "&:hover": { backgroundColor: "action.hover" } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography sx={{ fontSize: contentFontSize, flex: "1 1 auto", minWidth: 0 }} color="text.primary" fontWeight={600} noWrap>
            {ticket.nome}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5} sx={{ flex: "0 0 auto" }}>
            <Chip label={ticket.status} size="small" sx={{ fontWeight: 700, fontSize: contentFontSize }} />
            {cancelButton}
          </Box>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateRows: expanded ? "1fr" : "0fr",
            transition: "grid-template-rows 0.2s ease",
          }}
        >
          <Box sx={{ overflow: "hidden" }}>
            <Box display="flex" flexDirection="column" gap={0.5} mt={1} pt={1} borderTop="1px solid" borderColor="divider">
              <Typography sx={{ fontSize: contentFontSize }} color="text.secondary">Email: {ticket.email}</Typography>
              <Typography sx={{ fontSize: contentFontSize }} color="text.secondary">Telefone: {ticket.telefone}</Typography>
              <Typography sx={{ fontSize: contentFontSize }} color="text.secondary">Idade: {ticket.idade}</Typography>
              <Typography sx={{ fontSize: contentFontSize }} color="text.secondary">Valor pago: {formatarValor(ticket.valorPago)}</Typography>
              <Typography sx={{ fontSize: contentFontSize }} color="text.secondary">
                Validado em: {ticket.dataUso ? formatarDataHora(ticket.dataUso) : "-"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      sx={{ py: 1, px: 1, borderRadius: "0.5rem", "&:hover": { backgroundColor: "action.hover" } }}
    >
      <Typography sx={{ fontSize: contentFontSize, flex: "1 1 18%", minWidth: 0 }} color="text.primary" fontWeight={600} noWrap>
        {ticket.nome}
      </Typography>
      <Typography sx={{ fontSize: contentFontSize, flex: "1 1 22%", minWidth: 0 }} color="text.primary" noWrap>
        {ticket.email}
      </Typography>
      <Typography sx={{ fontSize: contentFontSize, flex: "1 1 13%", minWidth: 0 }} color="text.primary" noWrap>
        {ticket.telefone}
      </Typography>
      <Typography sx={{ fontSize: contentFontSize, flex: "0 0 auto", width: "3rem", textAlign: "center" }} color="text.primary" noWrap>
        {ticket.idade}
      </Typography>
      <Typography sx={{ fontSize: contentFontSize, flex: "0 0 auto", width: "5rem", textAlign: "right" }} color="text.primary" noWrap>
        {formatarValor(ticket.valorPago)}
      </Typography>
      <Box sx={{ flex: "0 0 auto" }}>
        <Chip label={ticket.status} size="small" sx={{ fontWeight: 700, fontSize: contentFontSize }} />
      </Box>
      <Typography sx={{ fontSize: contentFontSize, flex: "1 1 15%", minWidth: 0, textAlign: "right" }} color="text.secondary" noWrap>
        {ticket.dataUso ? formatarDataHora(ticket.dataUso) : "-"}
      </Typography>
      <Box sx={{ flex: "0 0 auto" }}>{cancelButton}</Box>
    </Box>
  );
}

export default function TicketsDialog({
  eventId,
  open,
  onClose,
}: {
  eventId: string;
  open: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const [ticketCancelando, setTicketCancelando] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets", eventId],
    queryFn: () => getTicketsByEvent(eventId),
    enabled: open && !!eventId,
  });

  const handleCancel = async (ticket: TicketDto) => {
    if (!confirm(`Excluir o ingresso de ${ticket.nome}? Esta ação não pode ser desfeita.`)) return;
    setTicketCancelando(ticket.id);
    try {
      await cancelTicket(ticket.id);
      await queryClient.invalidateQueries({ queryKey: ["tickets", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["lots", eventId] });
      await queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    } finally {
      setTicketCancelando(null);
    }
  };

  const handleExportPdf = () => {
    if (!tickets || tickets.length === 0) return;
    setExportando(true);
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const eventoNome = tickets[0]?.eventNome ?? "Evento";
      const margin = 32;
      let y = margin;

      pdf.setFontSize(14);
      pdf.text(`Ingressos vendidos - ${eventoNome}`, margin, y);
      y += 24;

      const cols = [
        { label: "Nome", width: 130 },
        { label: "Email", width: 160 },
        { label: "Telefone", width: 90 },
        { label: "Idade", width: 45 },
        { label: "Valor pago", width: 70 },
        { label: "Status", width: 70 },
        { label: "Validado em", width: 110 },
      ];

      const drawHeader = () => {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        let x = margin;
        for (const col of cols) {
          pdf.text(col.label, x, y);
          x += col.width;
        }
        y += 6;
        pdf.line(margin, y, margin + cols.reduce((s, c) => s + c.width, 0), y);
        y += 14;
        pdf.setFont("helvetica", "normal");
      };

      drawHeader();

      const pageHeight = pdf.internal.pageSize.getHeight();
      for (const ticket of tickets) {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
          drawHeader();
        }
        let x = margin;
        const values = [
          ticket.nome,
          ticket.email,
          ticket.telefone,
          String(ticket.idade),
          formatarValor(ticket.valorPago),
          ticket.status,
          ticket.dataUso ? formatarDataHora(ticket.dataUso) : "-",
        ];
        values.forEach((val, i) => {
          pdf.text(String(val), x, y, { maxWidth: cols[i].width - 4 });
          x += cols[i].width;
        });
        y += 16;
      }

      pdf.save(`ingressos-${eventoNome.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    } finally {
      setExportando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={isMobile ? "sm" : "lg"} fullWidth fullScreen={isSmallScreen}>
      <DialogTitle>Ingressos vendidos</DialogTitle>
      <DialogContent sx={{ overflowX: "hidden" }}>
        {isLoading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        )}
        {!isLoading && !isMobile && (
          <Box display="flex" alignItems="center" gap={2} sx={{ py: 1, px: 1 }}>
            <Typography sx={{ fontSize: contentFontSize, flex: "1 1 18%" }} color="text.secondary" fontWeight={700}>Nome</Typography>
            <Typography sx={{ fontSize: contentFontSize, flex: "1 1 22%" }} color="text.secondary" fontWeight={700}>Email</Typography>
            <Typography sx={{ fontSize: contentFontSize, flex: "1 1 13%" }} color="text.secondary" fontWeight={700}>Telefone</Typography>
            <Typography sx={{ fontSize: contentFontSize, flex: "0 0 auto", width: "3rem", textAlign: "center" }} color="text.secondary" fontWeight={700}>Idade</Typography>
            <Typography sx={{ fontSize: contentFontSize, flex: "0 0 auto", width: "5rem", textAlign: "right" }} color="text.secondary" fontWeight={700}>Valor pago</Typography>
            <Typography sx={{ fontSize: contentFontSize, flex: "0 0 auto", width: "5.5rem" }} color="text.secondary" fontWeight={700}>Status</Typography>
            <Typography sx={{ fontSize: contentFontSize, flex: "1 1 15%", textAlign: "right" }} color="text.secondary" fontWeight={700}>Validado em</Typography>
            <Box sx={{ flex: "0 0 auto", width: "2.25rem" }} />
          </Box>
        )}
        {!isLoading && !isMobile && <Divider sx={{ mb: 0.5 }} />}
        <Box sx={{ maxHeight: isSmallScreen ? "none" : "22rem", overflowY: "auto", overflowX: "hidden" }}>
          <Box display="flex" flexDirection="column" gap={0.5}>
            {tickets?.map((ticket, idx) => (
              <Box key={ticket.id}>
                <TicketRow ticket={ticket} isMobile={isMobile} onCancel={handleCancel} canceling={ticketCancelando === ticket.id} />
                {idx < tickets.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        </Box>
        {!isLoading && tickets?.length === 0 && (
          <Typography color="text.secondary" textAlign="center" py={3} sx={{ fontSize: contentFontSize }}>
            Nenhum ingresso vendido ainda.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<DownloadIcon />}
          onClick={handleExportPdf}
          disabled={exportando || !tickets || tickets.length === 0}
        >
          {exportando ? "Gerando PDF..." : "Baixar PDF"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
