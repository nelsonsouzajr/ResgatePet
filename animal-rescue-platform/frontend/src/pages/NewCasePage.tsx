import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { FormHint } from '@/components/FormHint';
import { createCase, uploadCaseImages } from '@/services/cases.service';
import { listOrganizations, OrganizationOption } from '@/services/organizations.service';

interface NewCaseForm {
  species: 'dog' | 'cat' | 'bird' | 'other';
  breed: string;
  color: string;
  estimated_age: string;
  gender: 'male' | 'female' | 'unknown';
  description: string;
  location_description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  latitude: string;
  longitude: string;
  organization_id: string;
}

const initialForm: NewCaseForm = {
  species: 'dog',
  breed: '',
  color: '',
  estimated_age: '',
  gender: 'unknown',
  description: '',
  location_description: '',
  priority: 'medium',
  latitude: '',
  longitude: '',
  organization_id: '',
};

export default function NewCasePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<NewCaseForm>(initialForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    listOrganizations()
      .then(setOrganizations)
      .catch(() => setOrganizations([]));
  }, []);

  const errors = useMemo(() => {
    return {
      description: !form.description.trim() ? 'Descrição do animal é obrigatória.' : '',
      location_description: !form.location_description.trim() ? 'Localização é obrigatória.' : '',
      latitude:
        form.latitude && (Number(form.latitude) < -90 || Number(form.latitude) > 90)
          ? 'Latitude deve estar entre -90 e 90.'
          : '',
      longitude:
        form.longitude && (Number(form.longitude) < -180 || Number(form.longitude) > 180)
          ? 'Longitude deve estar entre -180 e 180.'
          : '',
      photos: !photos.length ? 'Adicione ao menos uma foto do animal.' : '',
    };
  }, [form.description, form.latitude, form.location_description, form.longitude, photos.length]);

  function updateField<K extends keyof NewCaseForm>(field: K, value: NewCaseForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList) {
      setPhotos([]);
      return;
    }

    const files = Array.from(fileList).slice(0, 5);
    setPhotos(files);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setServerError(null);

    if (
      errors.description ||
      errors.location_description ||
      errors.latitude ||
      errors.longitude ||
      errors.photos
    ) {
      return;
    }

    try {
      setSubmitting(true);

      const created = await createCase({
        animal: {
          species: form.species,
          breed: form.breed || undefined,
          color: form.color || undefined,
          estimated_age: form.estimated_age || undefined,
          gender: form.gender,
          description: form.description,
        },
        organization_id: form.organization_id ? Number(form.organization_id) : undefined,
        priority: form.priority,
        location_description: form.location_description,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      });

      if (photos.length) {
        await uploadCaseImages(created.id, photos);
      }

      navigate(`/cases/${created.id}`);
    } catch {
      setServerError('Falha ao registrar ocorrência. Verifique se você está autenticado.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      title="Cadastro de Ocorrência"
      subtitle="Registre o animal, localização e prioridade para iniciar o atendimento."
    >
      <form className="card border border-sand-200" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Espécie</span>
            <select
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              value={form.species}
              onChange={(event) => updateField('species', event.target.value as NewCaseForm['species'])}
            >
              <option value="dog">Cão</option>
              <option value="cat">Gato</option>
              <option value="bird">Ave</option>
              <option value="other">Outro</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Prioridade</span>
            <select
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              value={form.priority}
              onChange={(event) => updateField('priority', event.target.value as NewCaseForm['priority'])}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Raça</span>
            <input
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              value={form.breed}
              onChange={(event) => updateField('breed', event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Cor</span>
            <input
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              value={form.color}
              onChange={(event) => updateField('color', event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Idade estimada</span>
            <input
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              value={form.estimated_age}
              onChange={(event) => updateField('estimated_age', event.target.value)}
              placeholder="Ex.: 2 anos"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Gênero</span>
            <select
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              value={form.gender}
              onChange={(event) => updateField('gender', event.target.value as NewCaseForm['gender'])}
            >
              <option value="unknown">Não identificado</option>
              <option value="male">Macho</option>
              <option value="female">Fêmea</option>
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-ink-700">Descrição do animal</span>
            <textarea
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              rows={4}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Estado físico, comportamento, sinais clínicos..."
            />
            <FormHint message={errors.description} />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-ink-700">Localização</span>
            <input
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              value={form.location_description}
              onChange={(event) => updateField('location_description', event.target.value)}
              placeholder="Rua, bairro, cidade, ponto de referência"
            />
            <FormHint message={errors.location_description} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Latitude</span>
            <input
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              value={form.latitude}
              onChange={(event) => updateField('latitude', event.target.value)}
              placeholder="-23.5505"
            />
            <FormHint message={errors.latitude} />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink-700">Longitude</span>
            <input
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              value={form.longitude}
              onChange={(event) => updateField('longitude', event.target.value)}
              placeholder="-46.6333"
            />
            <FormHint message={errors.longitude} />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-ink-700">Organização responsável (opcional)</span>
            <select
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              value={form.organization_id}
              onChange={(event) => updateField('organization_id', event.target.value)}
            >
              <option value="">Não atribuir agora</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} {org.city ? `· ${org.city}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-ink-700">Foto do animal</span>
            <input
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2 text-sm"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
            />
            <FormHint message={errors.photos} />
            {!!photos.length && (
              <p className="mt-2 text-xs font-semibold text-ink-500">{photos.length} arquivo(s) selecionado(s).</p>
            )}
          </label>
        </div>

        {serverError && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            {serverError}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Registrando...' : 'Registrar ocorrência'}
          </button>
        </div>
      </form>
    </AppShell>
  );
}
