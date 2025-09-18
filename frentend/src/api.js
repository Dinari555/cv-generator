const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export async function fetchCVs() {
  const res = await fetch(`${API_BASE}/cvs`);
  if (!res.ok) throw new Error('Erreur de récupération des CVs');
  return res.json();
}

export async function fetchCVById(id) {
  const res = await fetch(`${API_BASE}/cvs/${id}`);
  if (!res.ok) throw new Error('CV introuvable');
  return res.json();
}

export async function createCV(payload) {
  const res = await fetch(`${API_BASE}/cvs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erreur de création');
  return res.json();
}

export async function updateCV(id, payload) {
  const res = await fetch(`${API_BASE}/cvs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Erreur de modification');
  return res.json();
}

export async function deleteCV(id) {
  const res = await fetch(`${API_BASE}/cvs/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur de suppression');
  return res.json();
}

export function exportCVUrl(id) {
  return `${API_BASE}/cvs/${id}/export`;
}

export function previewCVUrl(id) {
  return `${API_BASE}/cvs/${id}/preview`;
}

export async function uploadPhoto(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE.replace(/\/api$/, '')}/api/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Erreur upload');
  return res.json();
}


