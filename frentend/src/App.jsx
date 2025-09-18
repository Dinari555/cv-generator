import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { fetchCVs, createCV, deleteCV, exportCVUrl, uploadPhoto, previewCVUrl } from './api'

function App() {
  const empty = useMemo(() => ({
    nom: '', prenom: '', email: '', tel: '', jobTitle: '', resume: '',
    skills: '', softSkills: '', tools: '', languages: '',
    adresse: '', city: '', country: '', linkedin: '', github: '', website: '', portfolio: '',
    theme: { preset: 'professional', mode: 'light' }, photo: ''
  }), [])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(empty)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchCVs()
      setItems(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        tel: form.tel,
        jobTitle: form.jobTitle,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        softSkills: form.softSkills ? form.softSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        tools: form.tools ? form.tools.split(',').map(s => s.trim()).filter(Boolean) : [],
        languages: form.languages ? form.languages.split(',').map(s => {
          const [name, level] = s.split('|').map(x => x.trim());
          return name ? (level ? { name, level } : { name }) : null;
        }).filter(Boolean) : [],
        adresse: form.adresse,
        city: form.city,
        country: form.country,
        linkedin: form.linkedin,
        github: form.github,
        website: form.website,
        portfolio: form.portfolio,
        resume: form.resume,
        photo: form.photo,
        theme: form.theme
      }
      await createCV(payload)
      setForm(empty)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onDelete(id) {
    setLoading(true)
    setError('')
    try {
      await deleteCV(id)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>CV Generator</h1>

      <form onSubmit={onSubmit} className="form">
        <input placeholder="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
        <input placeholder="Prénom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
        <input placeholder="Intitulé (ex: Growth Marketer)" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Téléphone" value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} />
        <textarea placeholder="Profil / Résumé" value={form.resume} onChange={e => setForm({ ...form, resume: e.target.value })} />

        <input placeholder="Compétences (séparées par des virgules)" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
        <input placeholder="Soft skills (par virgules)" value={form.softSkills} onChange={e => setForm({ ...form, softSkills: e.target.value })} />
        <input placeholder="Outils (par virgules)" value={form.tools} onChange={e => setForm({ ...form, tools: e.target.value })} />
        <input placeholder="Langues (ex: Français|C2, Anglais|B2)" value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })} />

        <input placeholder="Adresse" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
        <input placeholder="Ville" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        <input placeholder="Pays" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
        <input placeholder="LinkedIn" value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} />
        <input placeholder="GitHub" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
        <input placeholder="Site" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
        <input placeholder="Portfolio" value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} />

        <div className="inline">
          <label>Photo: </label>
          <input type="file" accept="image/*" onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            setLoading(true)
            try {
              const up = await uploadPhoto(f)
              setForm({ ...form, photo: up.filename })
            } catch (err) {
              setError(err.message)
            } finally { setLoading(false) }
          }} />
          {form.photo && <span>Fichier: {form.photo}</span>}
        </div>

        <div className="inline">
          <label>Thème: </label>
          <select value={form.theme?.preset || ''} onChange={e => setForm({ ...form, theme: { ...form.theme, preset: e.target.value } })}>
            <option value="">Personnalisé</option>
            <option value="professional">Professional</option>
            <option value="modern">Modern</option>
            <option value="elegant">Elegant</option>
            <option value="vibrant">Vibrant</option>
            <option value="night">Night</option>
          </select>
          <input placeholder="Primary (hex ou preset)" value={form.theme?.primaryColor || ''} onChange={e => setForm({ ...form, theme: { ...form.theme, primaryColor: e.target.value } })} />
          <input placeholder="Accent (hex ou preset)" value={form.theme?.accentColor || ''} onChange={e => setForm({ ...form, theme: { ...form.theme, accentColor: e.target.value } })} />
          <select value={form.theme?.mode || 'light'} onChange={e => setForm({ ...form, theme: { ...form.theme, mode: e.target.value } })}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <button disabled={loading} type="submit">{loading ? '...' : 'Créer CV'}</button>
      </form>

      {error && <div className="error">{error}</div>}

      <h2>Liste des CVs</h2>
      <ul className="list">
        {items.map(cv => (
          <li key={cv._id} className="item">
            <div>
              <strong>{cv.nom} {cv.prenom}</strong> — {cv.email} — {cv.tel}{cv.jobTitle ? ` — ${cv.jobTitle}` : ''}
            </div>
            <div className="actions">
              <a href={previewCVUrl(cv._id)} target="_blank" rel="noreferrer">Voir CV</a>
              <a href={exportCVUrl(cv._id)} target="_blank" rel="noreferrer">Exporter PDF</a>
              <button onClick={() => onDelete(cv._id)} disabled={loading}>Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
