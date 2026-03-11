import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { FormHint } from '@/components/FormHint';
import { useCaseDetails } from '@/hooks/useCaseDetails';
import { updateCaseStatus, uploadCaseImages } from '@/services/cases.service';
import { CaseStatus } from '@/types/case';

export default function UpdateCasePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const caseId = Number(id);

  const { data, loading, error } = useCaseDetails(Number.isNaN(caseId) ? undefined : caseId);

  const [status, setStatus] = useState<CaseStatus>('awaiting_rescue');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const formError = useMemo(() => {
    if (!status) return 'Selecione um status válido.';
    if (notes.length > 2000) return 'Observações devem ter no máximo 2000 caracteres.';
    return '';
  }, [notes.length, status]);

  function onFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const list = event.target.files;
    if (!list) {
      setFiles([]);
      return;
    }
    setFiles(Array.from(list).slice(0, 5));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setServerError(null);

    if (formError || Number.isNaN(caseId)) return;

    try {
      setSubmitting(true);
      await updateCaseStatus(caseId, { status, notes: notes || undefined });

      if (files.length) {
        await uploadCaseImages(caseId, files);
      }

      navigate(`/cases/${caseId}`);
    } catch {
      setServerError('Não foi possível atualizar o caso. Verifique a transição de status e sua autenticação.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      title={`Atualização do Caso ${Number.isNaN(caseId) ? '' : `#${caseId}`}`}
      subtitle="Altere status, adicione observações e anexe novas fotos da ocorrência."
      actions={
        !Number.isNaN(caseId) ? (
          <Link to={`/cases/${caseId}`} className="btn-secondary">Voltar aos detalhes</Link>
        ) : undefined
      }
    >
      {loading && <div className="card border border-sand-200 text-sm text-ink-500">Carregando caso...</div>}
      {error && <div className="card border border-rose-200 bg-rose-50 text-sm text-rose-700">{error}</div>}

      {!loading && !error && (
        <form className="card border border-sand-200" onSubmit={onSubmit}>
          {data && (
            <p className="mb-4 text-sm font-semibold text-ink-600">
              Status atual: <span className="font-black text-ink-900">{data.status}</span>
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-ink-700">Novo status</span>
              <select
                className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
                value={status}
                onChange={(event) => setStatus(event.target.value as CaseStatus)}
              >
                <option value="reported">Reportado</option>
                <option value="awaiting_rescue">Aguardando resgate</option>
                <option value="in_rescue">Em resgate</option>
                <option value="under_treatment">Em tratamento</option>
                <option value="resolved">Resolvido</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-ink-700">Observações</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
                rows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Descreva o progresso do caso, condutas e estado do animal."
              />
              <div className="mt-1 flex items-center justify-between text-xs font-semibold">
                <FormHint message={formError} />
                <span className="text-ink-500">{notes.length} / 2000</span>
              </div>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-ink-700">Anexar novas fotos</span>
              <input
                className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
                type="file"
                accept="image/*"
                multiple
                onChange={onFilesChange}
              />
              {!!files.length && (
                <p className="mt-2 text-xs font-semibold text-ink-500">{files.length} arquivo(s) selecionado(s).</p>
              )}
            </label>
          </div>

          {serverError && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              {serverError}
            </p>
          )}

          <div className="mt-6">
            <button type="submit" className="btn-primary" disabled={submitting || Boolean(formError)}>
              {submitting ? 'Salvando...' : 'Salvar atualização'}
            </button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
