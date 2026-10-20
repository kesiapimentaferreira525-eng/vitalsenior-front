/**
 * Lê o campo `exp` (segundos) de um JWT sem validar assinatura.
 * A validação real é sempre feita pelo backend; aqui é só para UX
 * (evitar mostrar telas privadas com token claramente expirado).
 */
export function lerExpiracaoJwt(token: string): number | null {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const preenchido = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = JSON.parse(decodeURIComponent(
      atob(preenchido)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    ));
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** true se o token tem `exp` e já passou (com 10 s de folga). */
export function jwtExpirado(token: string, agora: number = Date.now()): boolean {
  const exp = lerExpiracaoJwt(token);
  return exp !== null && exp - 10_000 <= agora;
}
