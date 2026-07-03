import { type ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SalesDeskSoftwareResearchEditor } from '../software-research/SalesDeskSoftwareResearchEditor';
import {
  useCreateSalesDeskSoftwareResearch,
  useSalesDeskPotentialOptions,
  useSalesDeskSoftwareResearch,
  useUpdateSalesDeskSoftwareResearch,
} from '../../hooks/useSalesDeskModules';
import type { SoftwareResearchFormValues } from '../../types/salesdesk-schemas';
import { salesDeskPageShellClass } from '../../lib/salesdesk-shared';

export function SalesDeskSoftwareResearchCreatePage(): ReactElement {
  const navigate = useNavigate();
  const createResearch = useCreateSalesDeskSoftwareResearch();
  const { data: potentials, isPending: potentialsPending } = useSalesDeskPotentialOptions();

  const handleSubmit = async (values: SoftwareResearchFormValues): Promise<void> => {
    await createResearch.mutateAsync(values);
    navigate('/salesdesk/software-research');
  };

  return (
    <div className={salesDeskPageShellClass}>
      <button
        type="button"
        onClick={() => navigate('/salesdesk/software-research')}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--crm-brand-accent)] transition-colors hover:text-[var(--crm-brand-primary)]"
      >
        <ArrowLeft size={16} />
        Arastirma listesine don
      </button>

      <SalesDeskSoftwareResearchEditor
        potentials={potentials ?? []}
        potentialsLoading={potentialsPending}
        isSaving={createResearch.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/salesdesk/software-research')}
      />
    </div>
  );
}

export function SalesDeskSoftwareResearchEditPage(): ReactElement {
  const navigate = useNavigate();
  const params = useParams();
  const researchId = Number(params.id);
  const updateResearch = useUpdateSalesDeskSoftwareResearch();
  const { data: potentials, isPending: potentialsPending } = useSalesDeskPotentialOptions();
  const { data: entity, isPending, isError, error } = useSalesDeskSoftwareResearch(
    Number.isFinite(researchId) ? researchId : null
  );

  const handleSubmit = async (values: SoftwareResearchFormValues): Promise<void> => {
    if (!entity) return;
    await updateResearch.mutateAsync({ id: entity.id, values });
    navigate('/salesdesk/software-research');
  };

  if (!Number.isFinite(researchId) || researchId <= 0) {
    return (
      <div className={salesDeskPageShellClass}>
        <p className="text-sm text-rose-500">Gecersiz arastirma kaydi.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className={`${salesDeskPageShellClass} flex min-h-[320px] items-center justify-center gap-2 text-sm text-[var(--crm-app-text-muted)]`}>
        <Loader2 size={18} className="animate-spin" />
        Arastirma yukleniyor...
      </div>
    );
  }

  if (isError || !entity) {
    return (
      <div className={salesDeskPageShellClass}>
        <p className="text-sm text-rose-500">{(error as Error)?.message || 'Arastirma bulunamadi.'}</p>
        <button
          type="button"
          onClick={() => navigate('/salesdesk/software-research')}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--crm-brand-accent)]"
        >
          <ArrowLeft size={16} />
          Listeye don
        </button>
      </div>
    );
  }

  return (
    <div className={salesDeskPageShellClass}>
      <button
        type="button"
        onClick={() => navigate('/salesdesk/software-research')}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--crm-brand-accent)] transition-colors hover:text-[var(--crm-brand-primary)]"
      >
        <ArrowLeft size={16} />
        Arastirma listesine don
      </button>

      <SalesDeskSoftwareResearchEditor
        potentials={potentials ?? []}
        potentialsLoading={potentialsPending}
        entity={entity}
        isSaving={updateResearch.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/salesdesk/software-research')}
      />
    </div>
  );
}
