export interface JwtPayload {
  sub: string;
  email?: string;
  moodleUserId?: number;
  usuarioLocalId?: number;
  exp?: number;
}

function decodeBase64Url(part: string): string {
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let i = 0;

  while (i < padded.length) {
    const enc1 = chars.indexOf(padded.charAt(i++));
    const enc2 = chars.indexOf(padded.charAt(i++));
    const enc3 = chars.indexOf(padded.charAt(i++));
    const enc4 = chars.indexOf(padded.charAt(i++));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    output += String.fromCharCode(chr1);
    if (enc3 !== 64) output += String.fromCharCode(chr2);
    if (enc4 !== 64) output += String.fromCharCode(chr3);
  }

  return output;
}

/** Decodifica el payload del JWT (solo lectura, sin verificar firma). */
export function decodeJwtPayload(token: string): JwtPayload {
  const part = token.split(".")[1];
  if (!part) throw new Error("Token JWT inválido");
  return JSON.parse(decodeBase64Url(part)) as JwtPayload;
}
