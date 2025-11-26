// URL da API - usa variável de ambiente ou localhost para desenvolvimento
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const text = await res.text();
  let data;
  
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("Resposta não-JSON da API:", text);
    throw new Error(`Erro do Servidor (${res.status}): ${text || res.statusText}`);
  }
  
  if (!res.ok) {
    throw new Error(data.error || "Erro na requisição");
  }
  
  return data;
}
