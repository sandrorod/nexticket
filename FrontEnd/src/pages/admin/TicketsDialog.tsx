import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, Chip, Divider, CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getTicketsByEvent } from "../../api/events";
import { formatarDataHora } from "../../utils/date";
import type { TicketDto } from "../../types";

const contentFontSize = "0.7875rem";

function TicketRow({ ticket, isMobile }: { ticket: TicketDto; isMobile: boolean }) {
  const [expanded, setExpanded] = useState(false);

  if (isMobile) {
    return (
      <Box
        onClick={() => setExpanded((e) => !e)}
        sx={{ py: 1, px: 1, borderRadius: "0.5rem", cursor: "pointer", "&:hover": { backgroundColor: "action.hover" } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography sx={{ fontSize: contentFontSize }} color="text.primary" fontWeight={600} noWrap>
            {ticket.nome}
          </Typography>
          <Chip label={ticket.status} size="small" sx={{ fontWeight: 700, fontSize: contentFontSize }} />
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
      <Typography sx={{ fontSize: contentFontSize, flex: "1 1 20%", minWidth: 0 }} color="text.primary" fontWeight={600} noWrap>
        {ticket.nome}
      </Typography>
      <Typography sx={{ fontSize: contentFontSize, flex: "1 1 25%", minWidth: 0 }} color="text.primary" noWrap>
        {ticket.email}
      </Typography>
      <Typography sx={{ fontSize: contentFontSize, flex: "1 1 15%", minWidth: 0 }} color="text.primary" noWrap>
        {ticket.telefone}
      </Typography>
      <Typography sx={{ fontSize: contentFontSize, flex: "0 0 auto", width: "3rem", textAlign: "center" }} color="text.primary" noWrap>
        {ticket.idade}
      </Typography>
      <Box sx={{ flex: "0 0 auto" }}>
        <Chip label={ticket.status} size="small" sx={{ fontWeight: 700, fontSize: contentFontSize }} />
      </Box>
      <Typography sx={{ fontSize: contentFontSize, flex: "1 1 20%", minWidth: 0, textAlign: "right" }} color="text.secondary" noWrap>
        {ticket.dataUso ? formatarDataHora(ticket.dataUso) : "-"}
      </Typography>
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

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets", eventId],
    queryFn: () => getTicketsByEvent(eventId),
    enabled: open && !!eventId,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth={isMobile ? "sm" : "lg"} fullWidth>
      <DialogTitle>Ingressos vendidos</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        )}
        {!isLoading && !isMobile && (
          <Box display="flex" alignItems="center" gap={2} sx={{ py: 1, px: 1 }}>
            <Typography sx={{ fontSize: contentFontSize, flex: "1 1 20%" }} color="text.secondary" fontWeight={700}>Nome</Typography>
            <Typography sx={{ fontSize: contentFontSize, flex: "1 1 25%" }} color="text.secondary" fontWeight={700}>Email</Typography>
            <Typography sx={{ fontSize: contentFontSize, flex: "1 1 15%" }} color="text.secondary" fontWeight={700}>Telefone</Typography>
            <Typography sx={{ fontSize: contentFontSize, flex: "0 0 auto", width: "3rem", textAlign: "center" }} color="text.secondary" fontWeight={700}>Idade</Typography>
            <Typography sx={{ fontSize: contentFontSize, flex: "0 0 auto", width: "5.5rem" }} color="text.secondary" fontWeight={700}>Status</Typography>
            <Typography sx={{ fontSize: contentFontSize, flex: "1 1 20%", textAlign: "right" }} color="text.secondary" fontWeight={700}>Validado em</Typography>
          </Box>
        )}
        {!isLoading && !isMobile && <Divider sx={{ mb: 0.5 }} />}
        <Box display="flex" flexDirection="column" gap={0.5}>
          {tickets?.map((ticket, idx) => (
            <Box key={ticket.id}>
              <TicketRow ticket={ticket} isMobile={isMobile} />
              {idx < tickets.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
        {!isLoading && tickets?.length === 0 && (
          <Typography color="text.secondary" textAlign="center" py={3} sx={{ fontSize: contentFontSize }}>
            Nenhum ingresso vendido ainda.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
