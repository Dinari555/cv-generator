// Simple heuristic-based helpers to provide modern CV assistance without external AI

const COMMON_SKILLS_BY_ROLE = {
  developpeur: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'Git', 'REST', 'CI/CD'],
  data: ['Python', 'Pandas', 'NumPy', 'SQL', 'Scikit-learn', 'TensorFlow', 'Data Viz'],
  design: ['Figma', 'UI/UX', 'Prototypage', 'Design System', 'Accessibility']
};

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9àâçéèêëîïôûùüÿñæœ\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

exports.suggestSkills = (req, res) => {
  const { resume = '', experience = [], targetRole = '' } = req.body || {};
  const tokens = new Set(tokenize(resume + ' ' + experience.map(e => `${e.poste} ${e.description}`).join(' ')));
  const role = (targetRole || '').toLowerCase();
  const base = COMMON_SKILLS_BY_ROLE[role] || [];
  const inferred = [];
  if (tokens.has('react')) inferred.push('React');
  if (tokens.has('node') || tokens.has('node.js')) inferred.push('Node.js');
  if (tokens.has('mongo') || tokens.has('mongodb')) inferred.push('MongoDB');
  if (tokens.has('python')) inferred.push('Python');
  if (tokens.has('sql')) inferred.push('SQL');
  const deduped = Array.from(new Set([...base, ...inferred]));
  res.json({ skills: deduped });
};

exports.generateSummary = (req, res) => {
  const { nom = '', prenom = '', years = 0, topSkills = [], lastRole = '' } = req.body || {};
  const name = [prenom, nom].filter(Boolean).join(' ');
  const skills = (topSkills || []).slice(0, 4).join(', ');
  const sentence = `${name} — ${years || 'X'} ans d'expérience en ${lastRole || 'votre domaine'}, spécialisé(e) en ${skills}. Focus sur impact, qualité et collaboration.`;
  res.json({ summary: sentence });
};

exports.tailorForJob = (req, res) => {
  const { skills = [], jobDescription = '' } = req.body || {};
  const jdTokens = new Set(tokenize(jobDescription));
  const matched = (skills || []).filter(s => jdTokens.has(s.toLowerCase()) || jobDescription.toLowerCase().includes(s.toLowerCase()));
  const missing = (skills || []).filter(s => !matched.includes(s));
  res.json({ matched, missing, recommendations: matched.slice(0, 6) });
};







