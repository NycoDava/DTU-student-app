import { useState } from 'react';
import type { AgendaItem } from '../../data/types';
import { deletePersonalEvent, getPersonalEvent } from '../../data/personalEvents';
import EventPreview from './EventPreview';
import EventForm, { type FormTarget } from './EventForm';

/** Preview card + add/edit sheet, shared by Home and the Calendar page. */
export function useEventDialogs() {
  const [preview, setPreview] = useState<AgendaItem | null>(null);
  const [form, setForm] = useState<FormTarget | null>(null);

  function editPreviewed() {
    const event = preview && getPersonalEvent(preview.id);
    setPreview(null);
    if (event) setForm({ event });
  }

  function deletePreviewed() {
    if (preview && window.confirm(`Delete "${preview.title}"?`)) {
      deletePersonalEvent(preview.id);
      setPreview(null);
    }
  }

  const dialogs = (
    <>
      {preview && (
        <EventPreview
          item={preview}
          onClose={() => setPreview(null)}
          onEdit={editPreviewed}
          onDelete={deletePreviewed}
        />
      )}
      {form && <EventForm target={form} onClose={() => setForm(null)} />}
    </>
  );

  return { openItem: setPreview, openForm: setForm, dialogs };
}
