// bcryptjs é compatível bit-a-bit com BCrypt.Net (mesma família de algoritmo),
// preservando os hashes já gravados no banco pela API .NET.
import bcrypt from "npm:bcryptjs@2.4.3";

const WORK_FACTOR = 12;

export function hashPassword(senha: string): string {
  return bcrypt.hashSync(senha, WORK_FACTOR);
}

export function verifyPassword(senha: string, hash: string): boolean {
  return bcrypt.compareSync(senha, hash);
}
