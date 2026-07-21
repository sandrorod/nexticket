# NexTicket

Plataforma de venda e validação de ingressos com QR Code.

## Stack

- **Backend**: ASP.NET Core (net8.0 — o SDK instalado é 8; ajuste `TargetFramework` para `net9.0` nos `.csproj` se instalar o SDK 9), Entity Framework Core, SQL Server, JWT, AutoMapper, FluentValidation, Serilog, Swagger.
- **Frontend**: React + Vite + TypeScript + Material UI (v6), React Router, TanStack Query, Zustand, Axios.

## Estrutura

```
NexTicket/
├── API/              # ASP.NET Core Web API (controllers, Program.cs)
├── Application/       # Casos de uso, DTOs, validators, AutoMapper, interfaces
├── Domain/             # Entidades, enums, exceções de domínio
├── Infrastructure/    # EF Core, repositórios, JWT, hashing, migrations
├── FrontEnd/           # React + Vite + MUI
└── Database/            # (reservado para scripts SQL avulsos)
```

## Rodando o backend

1. Suba um SQL Server local (ex: Docker):

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 --name nexticket-sql -d mcr.microsoft.com/mssql/server:2022-latest
```

2. Ajuste `API/appsettings.json` (connection string e `Jwt:Secret` — troque por um segredo forte antes de qualquer deploy).

3. Aplique a migration inicial:

```bash
export PATH="$PATH:$HOME/.dotnet/tools"   # se dotnet-ef não estiver no PATH
dotnet ef database update \
  --project Infrastructure/NexTicket.Infrastructure.csproj \
  --startup-project API/NexTicket.API.csproj
```

4. Rode a API:

```bash
dotnet run --project API/NexTicket.API.csproj
```

Swagger disponível em `https://localhost:{porta}/swagger`.

## Rodando o frontend

```bash
cd FrontEnd
npm install
npm run dev
```

Acesse `http://localhost:5173`. A URL da API é configurada em `FrontEnd/.env.development` (`VITE_API_URL`).

## O que já está implementado

- Cadastro/login de usuários (JWT), troca de senha.
- CRUD de eventos e lotes (admin).
- Compra de ingressos com **dados individuais por ingresso** (nome, email, telefone, CPF opcional) e validação anti-fraude: não permite repetir email, nem a combinação nome+telefone, dentro do mesmo evento (validado tanto em memória no request quanto contra o banco, dentro de uma transação).
- Emissão de ingressos com token único (32 bytes aleatórios, Base64URL) usado no QR Code, e código curto legível.
- Fluxo de validação em dois passos (preview + confirmação), evitando duplo check-in por condição de corrida via transação.
- Cupons de desconto (modelo de dados e criação; ainda não aplicados automaticamente no cálculo do pedido — próximo passo).
- Painel administrativo básico de validação de ingresso (busca por token + confirmação).
- Páginas: login, registro, listagem/detalhe de eventos, checkout com formulário por ingresso, meus ingressos com QR Code, validação (admin).

## O que falta (próximos passos sugeridos)

- Aplicar o desconto do cupom no cálculo do `OrderService` (hoje o DTO existe mas não é usado no fluxo de compra).
- Upload de imagem do evento (Azure Blob ou S3 — adiado propositalmente, ver requisito original).
- Integração de pagamento real (PIX/cartão) — hoje o pedido fica `Pendente` até alguém chamar `POST /orders/{id}/confirm-payment`.
- Leitura de QR Code via câmera no painel de validação (hoje é um campo de texto manual).
- Dashboard com gráficos (vendas por dia, receita, check-in).
- Relatórios (Excel/PDF/CSV) e envio de e-mail automático pós-compra.
- Testes automatizados (unitários e de integração).
- App mobile de validação (pasta `Mobile/` prevista na estrutura original, ainda não criada).

## Segurança implementada

- Senhas com BCrypt (work factor 12).
- Token de ingresso gerado com `RandomNumberGenerator` (criptograficamente seguro), nunca sequencial.
- Validação de ingresso feita inteiramente no servidor, dentro de transação, para evitar duplo check-in concorrente.
- Índices únicos no banco (`Tickets.Token`, `Tickets.Codigo`, e unicidade de email / nome+telefone por evento) como segunda camada de proteção além da validação em Application.
- JWT com expiração configurável e `ClockSkew` reduzido.
