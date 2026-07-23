FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY NexTicket.sln .
COPY API/NexTicket.API.csproj API/
COPY Application/NexTicket.Application.csproj Application/
COPY Infrastructure/NexTicket.Infrastructure.csproj Infrastructure/
COPY Domain/NexTicket.Domain.csproj Domain/

RUN dotnet restore API/NexTicket.API.csproj

COPY . .
RUN dotnet publish API/NexTicket.API.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "NexTicket.API.dll"]
