import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const SESSION_COOKIE = 'nexo_session';

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

export async function requireToken(): Promise<string> {
  const token = await getToken();
  if (!token) {
    redirect('/login');
  }
  return token;
}
