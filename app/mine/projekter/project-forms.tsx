'use client';

import { useActionState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import {
  createProject,
  deleteProject,
  assignReceiptToProject,
} from '../actions';

/** Opret projekt (specs/customer-projects.md). */
export function CreateProjectForm() {
  const t = useTranslations('projects');
  const [state, action, pending] = useActionState<
    { error?: string; success?: string },
    FormData
  >(createProject, {});

  return (
    <form action={action} className="space-y-2">
      <div className="flex gap-2">
        <input
          name="name"
          required
          maxLength={80}
          placeholder={t('namePlaceholder')}
          aria-label={t('namePlaceholder')}
          className="min-w-0 flex-1 rounded-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60 inline-flex items-center gap-2"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
          {t('create')}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-500">{state.error}</p>}
    </form>
  );
}

export function DeleteProjectButton({ projectId }: { projectId: number }) {
  const t = useTranslations('projects');
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  return (
    <button
      onClick={() => {
        if (!window.confirm(t('deleteConfirm'))) return;
        startTransition(async () => {
          await deleteProject(projectId);
          router.push('/mine/projekter');
          router.refresh();
        });
      }}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
      {t('delete')}
    </button>
  );
}

/** Flyt bon ind i/ud af projektet. */
export function AssignButton({
  receiptId,
  projectId,
  mode,
}: {
  receiptId: string;
  projectId: number;
  mode: 'add' | 'remove';
}) {
  const t = useTranslations('projects');
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await assignReceiptToProject(receiptId, mode === 'add' ? projectId : null);
          router.refresh();
        })
      }
      disabled={busy}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
        mode === 'add'
          ? 'bg-mint-tint text-forest'
          : 'text-muted-foreground hover:text-red-500'
      }`}
    >
      {busy ? '…' : mode === 'add' ? t('add') : t('remove')}
    </button>
  );
}
