"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../utils/api";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "cliente",
    origem: "orgânico", // Padrão
  });

  // Captura a origem da URL ao carregar (ex: ?origem=facebook_ads)
  useEffect(() => {
    const origemUrl = searchParams.get("origem");
    if (origemUrl) {
      setFormData(prev => ({ ...prev, origem: origemUrl }));
    }
  }, [searchParams]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      // Sucesso! Redirecionar para login
      alert("Conta criada com sucesso! Faça login.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLoginMock = () => {
    alert("TODO: Integração Real com Facebook Login será implementada aqui.\n(Ver PENDENCIAS.md)");
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">Crie sua Conta</h1>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-medium">{error}</div>}

        {/* Botão Facebook Mock */}
        <button
          type="button"
          onClick={handleFacebookLoginMock}
          className="w-full mb-4 py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Entrar com Facebook
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-xs sm:text-sm">ou use seu email</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="joao@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
            >
              <option value="cliente">Sou Cliente (Busco Advogado)</option>
              <option value="advogado">Sou Advogado</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          Já tem conta? <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition">Faça Login</a>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
          <RegisterContent />
        </Suspense>
      </div>
    </div>
  );
}
