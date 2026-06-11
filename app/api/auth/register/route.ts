import { NextResponse } from 'next/server';
import { decodeCredential } from '@/lib/auth-credentials';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { getBackendUrl } from '@/lib/backend-url';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nome = body?.nome;
    const email = body?.email;
    const credential = body?.credential;

    if (!nome || !email || !credential) {
      return NextResponse.json({ message: 'Preencha todos os campos' }, { status: 400 });
    }

    const senha = decodeCredential(String(credential));

    const res = await fetch(`${getBackendUrl()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        {
          message: getAuthErrorMessage(
            (data as { message?: string }).message,
            'register',
            res.status
          ),
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Erro ao criar conta' }, { status: 500 });
  }
}