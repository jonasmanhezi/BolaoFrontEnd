import { NextResponse } from 'next/server';
import { decodeCredential } from '@/lib/auth-credentials';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { getBackendUrl } from '@/lib/backend-url';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email;
    const credential = body?.credential;

    if (!email || !credential) {
      return NextResponse.json({ message: 'Email e credencial são obrigatórios' }, { status: 400 });
    }

    const senha = decodeCredential(String(credential));

    const res = await fetch(`${getBackendUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        {
          message: getAuthErrorMessage(
            (data as { message?: string }).message,
            'login',
            res.status
          ),
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Erro ao fazer login' }, { status: 500 });
  }
}