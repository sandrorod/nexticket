import { Box, Container, Typography, Stack } from "@mui/material";

export default function TermsPage() {
  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary" mb={1} sx={{ fontSize: "1.7rem" }}>
          Termos de Uso
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </Typography>

        <Stack spacing={3}>
          <Section title="1. Aceitação dos termos">
            Ao acessar e utilizar a plataforma NexTicket, você concorda com estes Termos de Uso.
            Caso não concorde com qualquer disposição aqui prevista, não utilize a plataforma.
          </Section>

          <Section title="2. Descrição do serviço">
            A NexTicket é uma plataforma de venda e gestão de ingressos para eventos, que conecta
            organizadores de eventos a compradores de ingressos, permitindo a emissão de ingressos
            digitais com validação por QR Code.
          </Section>

          <Section title="3. Cadastro e conta">
            Para realizar compras, o usuário deve criar uma conta fornecendo informações verdadeiras,
            completas e atualizadas. O usuário é responsável por manter a confidencialidade de sua
            senha e por todas as atividades realizadas em sua conta.
          </Section>

          <Section title="4. Compra de ingressos">
            Os ingressos são vendidos conforme disponibilidade e sujeitos aos preços, lotes e
            condições estabelecidos pelo organizador de cada evento. O comprovante de compra e o
            ingresso digital (QR Code) devem ser apresentados, junto com documento oficial com foto,
            para acesso ao evento.
          </Section>

          <Section title="5. Cancelamentos e reembolsos">
            Cancelamentos e reembolsos seguem as regras específicas de cada evento, definidas pelo
            organizador, respeitando a legislação vigente aplicável ao consumidor. Ingressos não
            utilizados não geram direito automático a reembolso, salvo cancelamento do evento pelo
            organizador.
          </Section>

          <Section title="6. Responsabilidades do organizador">
            O organizador é o único responsável pela realização do evento, incluindo data, horário,
            local, conteúdo e demais condições anunciadas. A NexTicket atua exclusivamente como
            intermediária na venda e gestão de ingressos.
          </Section>

          <Section title="7. Uso indevido">
            É proibido utilizar a plataforma para fins ilícitos, revenda não autorizada de ingressos,
            fraude, ou qualquer conduta que viole direitos de terceiros ou a legislação aplicável.
          </Section>

          <Section title="8. Alterações nos termos">
            Estes Termos de Uso podem ser atualizados periodicamente. O uso continuado da plataforma
            após alterações constitui aceitação dos novos termos.
          </Section>

          <Section title="9. Contato">
            Em caso de dúvidas sobre estes Termos de Uso, entre em contato através dos canais
            disponíveis na plataforma.
          </Section>
        </Stack>
      </Container>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={700} color="text.primary" mb={1} sx={{ textAlign: "left" }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.8, textAlign: "left", fontSize: "0.7875rem" }}>
        {children}
      </Typography>
    </Box>
  );
}
