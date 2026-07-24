import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { UnauthorizedAppError } from "./errors.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
const JWT_ISSUER = Deno.env.get("JWT_ISSUER") ?? "NexTicket.API";
const JWT_AUDIENCE = Deno.env.get("JWT_AUDIENCE") ?? "NexTicket.Client";
const JWT_EXPIRATION_MINUTES = Number(Deno.env.get("JWT_EXPIRATION_MINUTES") ?? "120");

export type UserRole = "Comprador" | "Administrador" | "Validador";

export interface JwtPayload {
  [key: string]: unknown;
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  iss: string;
  aud: string;
  exp: number;
  jti: string;
}

let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  cachedKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return cachedKey;
}

export async function generateToken(userId: string, email: string, nome: string, role: UserRole): Promise<string> {
  const key = await getKey();
  const payload: JwtPayload = {
    sub: userId,
    email,
    name: nome,
    role,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
    exp: getNumericDate(JWT_EXPIRATION_MINUTES * 60),
    jti: crypto.randomUUID(),
  };
  return await create({ alg: "HS256", typ: "JWT" }, payload, key);
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const key = await getKey();
  try {
    const payload = await verify(token, key) as unknown as JwtPayload;
    if (payload.iss !== JWT_ISSUER || payload.aud !== JWT_AUDIENCE) {
      throw new Error("Issuer/audience inválidos.");
    }
    return payload;
  } catch {
    throw new UnauthorizedAppError("Token inválido ou expirado.");
  }
}

export async function requireAuth(req: Request): Promise<JwtPayload> {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedAppError("Token não informado.");
  }
  return await verifyToken(header.slice("Bearer ".length));
}

export function requireRole(payload: JwtPayload, ...roles: UserRole[]): void {
  if (!roles.includes(payload.role)) {
    throw new UnauthorizedAppError("Você não tem permissão para acessar este recurso.");
  }
}
