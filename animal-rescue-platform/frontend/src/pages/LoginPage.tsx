import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/auth.service';
import { FormHint } from '@/components/FormHint';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = useMemo(() => {
    return {
      email: email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Informe um e-mail válido.' : '',
      password: password && password.length < 6 ? 'A senha deve ter pelo menos 6 caracteres.' : '',
    };
  }, [email, password]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setServerError(null);

    if (!email || !password || errors.email || errors.password) {
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setServerError('Falha ao autenticar. Verifique e-mail e senha.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-sand-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-brand">ResgatePet</p>
        <h1 className="mt-2 text-2xl font-black text-ink-900">Acesso da equipe</h1>
        <p className="mt-1 text-sm text-ink-500">Entre com suas credenciais para gerenciar as ocorrências.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-ink-700">E-mail</span>
            <input
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@dominio.com"
            />
            <FormHint message={errors.email} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Senha</span>
            <input
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="******"
            />
            <FormHint message={errors.password} />
          </label>

          {serverError && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting || Boolean(errors.email || errors.password)}
          >
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
