export function getAuthHeaders(requireGrupo = true): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error('Token ausente. Faça login novamente.');
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  if (requireGrupo) {
    const grupoId = typeof window !== 'undefined' ? localStorage.getItem('grupoId') : null;
    if (!grupoId) {
      throw new Error('Grupo não selecionado.');
    }
    headers['X-Group-Id'] = grupoId;
  }

  return headers;
}