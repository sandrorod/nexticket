import { Box, Container, Typography, Stack } from "@mui/material";

export default function PrivacyPage() {
  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "calc(100vh - 4.75rem)" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary" mb={1}>
          Política de Privacidade
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </Typography>

        <Stack spacing={3}>
          <Section title="1. Dados coletados">
            Coletamos dados fornecidos diretamente por você ao criar uma conta ou comprar ingressos,
            como nome, e-mail, telefone e, quando aplicável, CPF. Também coletamos dados de uso da
            plataforma para fins de segurança e melhoria do serviço.
          </Section>

          <Section title="2. Finalidade do tratamento">
            Os dados são utilizados para viabilizar a criação de conta, processar compras, emitir
            ingressos digitais, validar o acesso a eventos, enviar comunicações relacionadas às
            compras (como recuperação de senha e confirmação de pedido) e cumprir obrigações legais.
          </Section>

          <Section title="3. Compartilhamento de dados">
            Dados de ingressos (nome e documento, quando exigido) podem ser compartilhados com o
            organizador do evento correspondente, exclusivamente para fins de controle de acesso e
            check-in. Não vendemos dados pessoais a terceiros.
          </Section>

          <Section title="4. Armazenamento e segurança">
            Os dados são armazenados em infraestrutura com controles de segurança técnicos e
            administrativos para prevenir acesso não autorizado, perda ou alteração indevida das
            informações.
          </Section>

          <Section title="5. Direitos do titular">
            Você pode solicitar a qualquer momento a confirmação da existência de tratamento,
            acesso, correção, anonimização ou eliminação de seus dados pessoais, nos termos da
            legislação de proteção de dados aplicável.
          </Section>

          <Section title="6. Cookies">
            A plataforma pode utilizar cookies e tecnologias semelhantes para manter sua sessão
            ativa, lembrar preferências e melhorar a experiência de navegação.
          </Section>

          <Section title="7. Retenção de dados">
            Os dados pessoais são mantidos pelo tempo necessário para cumprir as finalidades para as
            quais foram coletados, incluindo eventuais obrigações legais, fiscais ou regulatórias.
          </Section>

          <Section title="8. Alterações nesta política">
            Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças
            em nossas práticas ou na legislação aplicável. Recomendamos a revisão periódica desta
            página.
          </Section>

          <Section title="9. Contato">
            Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados pessoais,
            entre em contato através dos canais disponíveis na plataforma.
          </Section>
        </Stack>
      </Container>
    </Box>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.8 }}>
        {children}
      </Typography>
    </Box>
  );
}
