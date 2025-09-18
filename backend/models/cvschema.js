const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  prenom: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  tel: { type: String, required: true, trim: true },

  resume: { type: String, trim: true },
  photo: { type: String, trim: true },
  path: { type: String, trim: true },

  // Sections du CV
  jobTitle: { type: String, trim: true },
  skills: { type: [String], default: [] },
  softSkills: { type: [String], default: [] },
  tools: { type: [String], default: [] },
  languages: {
    type: [
      {
        name: { type: String, trim: true },
        level: { type: String, trim: true }
      }
    ],
    default: []
  },
  hobbies: { type: [String], default: [] },

  experience: [
    {
      poste: { type: String, trim: true },
      entreprise: { type: String, trim: true },
      dateDebut: { type: Date },
      dateFin: { type: Date },
      description: { type: String, trim: true }
    }
  ],

  education: [
    {
      diplome: { type: String, trim: true },
      ecole: { type: String, trim: true },
      dateDebut: { type: Date },
      dateFin: { type: Date }
    }
  ],

  projects: [
    {
      titre: { type: String, trim: true },
      description: { type: String, trim: true },
      technologies: { type: [String], default: [] },
      lien: { type: String, trim: true }
    }
  ],

  certifications: [
    {
      nom: { type: String, trim: true },
      organisme: { type: String, trim: true },
      date: { type: Date }
    }
  ],

  awards: [
    {
      titre: { type: String, trim: true },
      organisme: { type: String, trim: true },
      date: { type: Date },
      description: { type: String, trim: true }
    }
  ],

  mostProudOf: [
    {
      titre: { type: String, trim: true },
      description: { type: String, trim: true }
    }
  ],

  // Réseaux sociaux / liens
  linkedin: { type: String, trim: true },
  github: { type: String, trim: true },
  twitter: { type: String, trim: true },
  facebook: { type: String, trim: true },
  instagram: { type: String, trim: true },
  portfolio: { type: String, trim: true },
  website: { type: String, trim: true },

  adresse: { type: String, trim: true },
  city: { type: String, trim: true },
  country: { type: String, trim: true },
  disponibilite: { type: String, trim: true },

  theme: {
    preset: { type: String, trim: true, enum: ['professional','modern','elegant','vibrant','night'], required: false },
    primaryColor: { type: String, trim: true, default: '#2E86DE' },
    accentColor: { type: String, trim: true, default: '#7D3C98' },
    mode: { type: String, enum: ['light','dark'], default: 'light' }
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CV', cvSchema);
