// Genera el valor para ADMIN_PASSWORD_HASH en tu .env.
//
// Uso:
//   node scripts/hash-password.mjs "tu-contraseña-segura"
//
// Copia la línea "ADMIN_PASSWORD_HASH=..." que imprime y pégala en tu
// .env. Tu contraseña en texto plano nunca se guarda en ningún lado —
// solo el hash.
import { scryptSync, randomBytes } from "crypto";

const password = process.argv[2];

if (!password) {
  console.error('Uso: node scripts/hash-password.mjs "tu-contraseña-segura"');
  process.exit(1);
}

if (password.length < 8) {
  console.error("Usa una contraseña de al menos 8 caracteres.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");

console.log("\nAgrega esta línea a tu .env:\n");
console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}\n`);
