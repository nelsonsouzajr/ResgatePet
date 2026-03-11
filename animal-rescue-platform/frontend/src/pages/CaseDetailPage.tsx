import { Link, useParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { MapBoard } from '@/components/MapBoard';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { useCaseDetails } from '@/hooks/useCaseDetails';

export default function CaseDetailPage() {
  const { id } = useParams();
  const caseId = Number(id);
  const { data, loading, error } = useCaseDetails(Number.isNaN(caseId) ? undefined : caseId);

  return (
    <AppShell
      title={`Detalhes da Ocorrência ${Number.isNaN(caseId) ? '' : `#${caseId}`}`}
      subtitle="Acompanhe dados do animal, localização, imagens e histórico do caso."
      actions={
        !Number.isNaN(caseId) ? (
          <Link to={`/cases/${caseId}/edit`} className="btn-primary">Atualizar caso</Link>
        ) : undefined
      }
    >
      {Number.isNaN(caseId) && (
        <div className="card border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700">
          ID inválido.
        </div>
      )}

      {loading && <div className="card border border-sand-200 text-sm text-ink-500">Carregando detalhes...</div>}
      {error && <div className="card border border-rose-200 bg-rose-50 text-sm text-rose-700">{error}</div>}

      {!loading && !error && data && (
        <>
          <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <article className="card border border-sand-200">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={data.status} />
                <PriorityBadge priority={data.priority} />
              </div>
              <h2 className="mt-3 text-xl font-black text-ink-900">
                {data.animal.species.toUpperCase()} {data.animal.breed ? `· ${data.animal.breed}` : ''}
              </h2>
              <p className="mt-2 text-sm text-ink-600">{data.animal.description ?? 'Sem descrição informada.'}</p>

              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-ink-500">Cor</dt>
                  <dd className="font-semibold text-ink-800">{data.animal.color ?? 'Não informado'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-ink-500">Idade estimada</dt>
                  <dd className="font-semibold text-ink-800">{data.animal.estimated_age ?? 'Não informada'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-ink-500">Gênero</dt>
                  <dd className="font-semibold text-ink-800">{data.animal.gender}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-ink-500">Reportado por</dt>
                  <dd className="font-semibold text-ink-800">{data.reporter.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-ink-500">Organização</dt>
                  <dd className="font-semibold text-ink-800">{data.organization?.name ?? 'Não atribuída'}</dd>
                </div>
              </dl>
            </article>

            <article className="card border border-sand-200">
              <h3 className="text-base font-black text-ink-900">Localização</h3>
              <p className="mt-2 text-sm text-ink-600">
                {data.location_description ?? 'Sem descrição de localização.'}
              </p>
              <div className="mt-4">
                <MapBoard
                  heightClass="h-64"
                  pins={[
                    {
                      id: data.id,
                      label: `Caso #${data.id}`,
                      latitude: data.latitude,
                      longitude: data.longitude,
                    },
                  ]}
                />
              </div>
            </article>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="card border border-sand-200">
              <h3 className="text-base font-black text-ink-900">Imagens</h3>
              {!!data.images.length && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {data.images.map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-xl border border-sand-200">
                      <img
                        src={image.image_url}
                        alt={`Imagem da ocorrência ${data.id}`}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              {!data.images.length && (
                <p className="mt-3 text-sm text-ink-500">Nenhuma imagem enviada para esta ocorrência.</p>
              )}
            </article>

            <article className="card border border-sand-200">
              <h3 className="text-base font-black text-ink-900">Histórico de atualizações</h3>
              <div className="mt-4 space-y-3">
                {data.updates.map((update) => (
                  <div key={update.id} className="rounded-xl border border-sand-200 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={update.status} />
                      <p className="text-xs font-semibold text-ink-500">
                        {new Date(update.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink-700">{update.updated_by_name}</p>
                    <p className="mt-1 text-sm text-ink-600">{update.notes ?? 'Sem observações.'}</p>
                  </div>
                ))}

                {!data.updates.length && (
                  <p className="text-sm text-ink-500">Sem atualizações registradas até o momento.</p>
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </AppShell>
  );
}
