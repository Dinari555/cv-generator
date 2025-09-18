const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function sanitizeString(value, { allowEmail = false } = {}) {
  if (!value || typeof value !== 'string') return '';
  let v = value.replace(/\s+/g, ' ').trim();
  v = v.replace(/[|;]{1,}/g, '');
  const allowed = allowEmail ? /[^\p{L}0-9 @._+\-,'/()]/gu : /[^\p{L}0-9 .,+\-,'/()]/gu;
  v = v.replace(allowed, '');
  return v.trim();
}

function safeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(x => typeof x === 'string' ? sanitizeString(x) : x)
    .map(x => (typeof x === 'string' ? x : x))
    .filter(x => {
      if (!x) return false;
      if (typeof x === 'string') return x.length >= 2;
      return true;
    });
}

function formatPhone(tel) {
  const digits = (tel || '').toString().replace(/\D/g, '');
  if (digits.length < 6) return '';
  return digits.replace(/(\d{2,3})(\d{2,3})(\d{2,3})(\d+)?/, (m, a, b, c, d) => [a, b, c, d].filter(Boolean).join(' '));
}

function normalizeCV(input) {
  const c = typeof input.toObject === 'function' ? input.toObject() : JSON.parse(JSON.stringify(input || {}));
  c.nom = sanitizeString(c.nom) || 'Non renseigné';
  c.prenom = sanitizeString(c.prenom) || 'Non renseigné';
  c.jobTitle = sanitizeString(c.jobTitle) || '';
  c.email = sanitizeString(c.email, { allowEmail: true }) || 'Non renseigné';
  c.tel = formatPhone(c.tel) || 'Non renseigné';
  c.adresse = sanitizeString(c.adresse) || '';
  c.city = sanitizeString(c.city) || '';
  c.country = sanitizeString(c.country) || '';
  c.resume = sanitizeString(c.resume) || '';

  c.skills = safeArray(c.skills);
  c.softSkills = safeArray(c.softSkills);
  c.tools = safeArray(c.tools);

  if (Array.isArray(c.languages)) {
    c.languages = c.languages
      .map(l => {
        if (typeof l === 'string') return sanitizeString(l);
        if (l && typeof l === 'object') {
          const name = sanitizeString(l.name);
          const level = sanitizeString(l.level);
          return level ? `${name} (${level})` : name;
        }
        return '';
      })
      .filter(Boolean);
  } else c.languages = [];

  c.experience = Array.isArray(c.experience) ? c.experience
    .map(e => ({
      poste: sanitizeString(e.poste),
      entreprise: sanitizeString(e.entreprise),
      dateDebut: e.dateDebut ? new Date(e.dateDebut) : null,
      dateFin: e.dateFin ? new Date(e.dateFin) : null,
      description: sanitizeString(e.description)
    }))
    .filter(e => e.poste || e.entreprise || e.description) : [];

  c.education = Array.isArray(c.education) ? c.education
    .map(e => ({
      diplome: sanitizeString(e.diplome),
      ecole: sanitizeString(e.ecole),
      dateDebut: e.dateDebut ? new Date(e.dateDebut) : null,
      dateFin: e.dateFin ? new Date(e.dateFin) : null
    }))
    .filter(e => e.diplome || e.ecole) : [];

  c.hobbies = safeArray(c.hobbies);

  return c;
}

exports.generateCVPdf = (cv, res, options = {}) => {
  try {
    const doc = new PDFDocument({ margin: 48 });

    const inline = options.inline === true;

    const filePath = path.join(__dirname, `../uploads/cv-${cv._id}.pdf`);

    if (inline) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="cv-${cv._id}.pdf"`);
      doc.pipe(res);
    } else {
      try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      stream.on("finish", () => {
        res.download(filePath);
      });
    }

    const { PRESET_COLORS, isHexColor, THEME_PRESETS } = require('../config/colors');
    cv = normalizeCV(cv);
    let color = '#2E86DE';
    let accent = '#7D3C98';
    let mode = 'light';
    if (cv.theme && cv.theme.preset && THEME_PRESETS[cv.theme.preset]) {
      const preset = THEME_PRESETS[cv.theme.preset];
      if (preset.primaryColor) color = PRESET_COLORS[preset.primaryColor] || preset.primaryColor;
      if (preset.accentColor) accent = PRESET_COLORS[preset.accentColor] || preset.accentColor;
      if (preset.mode) mode = preset.mode;
    }

    if (cv.theme && cv.theme.primaryColor) {
      const value = cv.theme.primaryColor;
      if (isHexColor(value)) color = value;
      else if (PRESET_COLORS[value]) color = PRESET_COLORS[value];
    }
    if (cv.theme && cv.theme.accentColor) {
      const value = cv.theme.accentColor;
      if (isHexColor(value)) accent = value;
      else if (PRESET_COLORS[value]) accent = PRESET_COLORS[value];
    }
    if (cv.theme && cv.theme.mode) {
      mode = cv.theme.mode;
    }

    const pageBgDark = '#111111';
    const textColor = mode === 'dark' ? '#ffffff' : '#000000';
    if (mode === 'dark') {
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(pageBgDark);
    }
    doc.fillColor(textColor);

    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
      .strokeColor(accent)
      .lineWidth(2)
      .stroke();

    const sidebarWidth = 170;
    doc.save();
    doc.fillColor(mode === 'dark' ? '#0f1e2e' : '#f0f6ff');
    doc.rect(0, 0, sidebarWidth, doc.page.height).fill();
    doc.restore();

    const contentX = sidebarWidth + 24;
    const contentTop = 64;
    const contentWidth = doc.page.width - contentX - 48;
    doc.x = contentX;
    doc.y = contentTop;

    doc.fillColor(color).fontSize(20)
      .text("Curriculum Vitae", contentX, doc.y - 12, { width: contentWidth, align: 'center' });
    doc.moveDown(0.2);

    const fullName = [cv.prenom, cv.nom].filter(Boolean).join(' ');
    doc.fillColor(textColor).fontSize(28)
      .text(fullName || 'Votre Nom', contentX, doc.y, { width: contentWidth * 0.7 });
    if (cv.jobTitle) {
      doc.fillColor('#6b7280').fontSize(14).text(cv.jobTitle, contentX, undefined, { width: contentWidth * 0.7 });
    }
    doc.moveDown(0.6);

    let sidebarBottomOfPhoto = 140;
    try {
      if (cv.photo) {
        const photoPath = cv.photo.startsWith('/') || cv.photo.startsWith('C:')
          ? (path.isAbsolute(cv.photo) ? cv.photo : path.join(__dirname, `..${cv.photo}`))
          : path.join(__dirname, `../uploads/${cv.photo}`);

        const imgSize = 110;
        const imgX = (sidebarWidth - imgSize) / 2;
        const imgY = 58;

        doc.save();
        const cx = imgX + imgSize / 2;
        const cy = imgY + imgSize / 2;
        doc.circle(cx, cy, imgSize / 2 + 6)
          .lineWidth(3)
          .strokeColor(color)
          .stroke();
        doc.circle(cx, cy, imgSize / 2).clip();
        doc.image(photoPath, imgX, imgY, { width: imgSize, height: imgSize, cover: [imgSize, imgSize] });
        doc.restore();
        sidebarBottomOfPhoto = imgY + imgSize + 22;
      }
    } catch (e) {
    }
    doc.fillColor(textColor);

    doc.fontSize(12).text(`Nom : ${cv.nom}`, contentX, doc.y + 8, { width: contentWidth });
    doc.text(`Prénom : ${cv.prenom}`, { width: contentWidth });
    if (cv.jobTitle) doc.text(`Intitulé : ${cv.jobTitle}`, { width: contentWidth });
    doc.text(`Email : ${cv.email}`, { width: contentWidth });
    doc.text(`Téléphone : ${cv.tel}`, { width: contentWidth });
    doc.moveDown();

    if (cv.resume) {
      doc.fillColor(color).fontSize(14).text("Profil", contentX, undefined, { underline: true, width: contentWidth });
      doc.fillColor(textColor).fontSize(12).text(cv.resume, { width: contentWidth });
      doc.moveDown();
    }

    if (cv.skills && cv.skills.length) {
      doc.fillColor(color).fontSize(14).text("Compétences :", contentX, undefined, { underline: true, width: contentWidth });
      doc.fillColor(textColor).fontSize(12).text(cv.skills.join(', '), { width: contentWidth });
      doc.moveDown();
    }

    const drawSectionTitle = (label) => {
      const startY = doc.y + 6;
      doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold').text(label.toUpperCase(), contentX, startY, { width: contentWidth });
      const textWidth = doc.widthOfString(label.toUpperCase());
      const lineY = doc.y + 2;
      doc.moveTo(contentX + textWidth + 8, lineY)
        .lineTo(contentX + contentWidth, lineY)
        .lineWidth(1)
        .strokeColor('#D1D5DB')
        .stroke();
      doc.moveDown(0.8);
      doc.font('Helvetica');
    };

    if (cv.experience && cv.experience.length) {
      drawSectionTitle('EXPÉRIENCE PROFESSIONNELLE');
      cv.experience.forEach((exp) => {
        const leftText = `${exp.poste || ''}${exp.entreprise ? ' — ' + exp.entreprise : ''}`;
        const dates = `${exp.dateDebut ? new Date(exp.dateDebut).getFullYear() : ''} - ${exp.dateFin ? new Date(exp.dateFin).getFullYear() : ''}`;
        const startY = doc.y;
        doc.fillColor(textColor).fontSize(12).text(leftText, contentX, startY, { width: contentWidth - 120 });
        doc.fontSize(10).fillColor('#6b7280').text(dates, contentX, startY, { width: contentWidth, align: 'right' });
        if (exp.description) {
          doc.moveDown(0.2);
          doc.fillColor(textColor).fontSize(11).text(exp.description, { width: contentWidth });
        }
        doc.moveDown(0.8);
      });
    }

    if (cv.education && cv.education.length) {
      drawSectionTitle('ÉDUCATION');
      cv.education.forEach((ed) => {
        const leftText = `${ed.diplome || ''}${ed.ecole ? ' — ' + ed.ecole : ''}`;
        const dates = `${ed.dateDebut ? new Date(ed.dateDebut).getFullYear() : ''} - ${ed.dateFin ? new Date(ed.dateFin).getFullYear() : ''}`;
        const y = doc.y;
        doc.fillColor(textColor).fontSize(12).text(leftText, contentX, y, { width: contentWidth - 120 });
        doc.fontSize(10).fillColor('#6b7280').text(dates, contentX, y, { width: contentWidth, align: 'right' });
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    if (cv.languages && cv.languages.length) {
      doc.fillColor(color).fontSize(14).text("Langues :", contentX, undefined, { underline: true, width: contentWidth });
      const langs = cv.languages.map(l => typeof l === 'string' ? l : `${l.name}${l.level ? ' ('+l.level+')' : ''}`);
      doc.fillColor(textColor).fontSize(12).text(langs.join(', '), { width: contentWidth });
      doc.moveDown();
    }

    if (cv.projects && cv.projects.length) {
      drawSectionTitle('PROJETS');
      cv.projects.forEach((p) => {
        doc.fillColor(textColor).fontSize(12).text(p.titre || 'Projet', { width: contentWidth });
        if (p.description) doc.text(p.description, { width: contentWidth });
        if (p.technologies && p.technologies.length) doc.text(`Tech: ${p.technologies.join(', ')}`, { width: contentWidth });
        if (p.lien) doc.text(`Lien: ${p.lien}`, { width: contentWidth });
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    if (cv.certifications && cv.certifications.length) {
      drawSectionTitle('CERTIFICATIONS');
      cv.certifications.forEach((c) => {
        doc.fillColor(textColor).fontSize(12).text(c.nom || 'Certification', { width: contentWidth });
        if (c.organisme) doc.text(`Organisme: ${c.organisme}`, { width: contentWidth });
        if (c.date) doc.text(new Date(c.date).toLocaleDateString(), { width: contentWidth });
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    if (cv.hobbies && cv.hobbies.length) {
      drawSectionTitle('CENTRES D'INTÉRÊT');
      cv.hobbies.forEach((h) => {
        doc.fillColor(textColor).fontSize(12).text(`• ${h}`, { width: contentWidth });
      });
      doc.moveDown();
    }

    const sidebarTitle = (label, y) => {
      const pillX = 20;
      const pillW = sidebarWidth - 40;
      const pillH = 24;
      doc.save();
      doc.roundedRect(pillX, y, pillW, pillH, 12).fillColor(accent).fill();
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(label, pillX, y + 6, { width: pillW, align: 'center' });
      doc.restore();
      return y + pillH + 10;
    };

    doc.save();
    const sidebarTextColor = mode === 'dark' ? '#E6F1FF' : '#0F172A';
    doc.fillColor(sidebarTextColor).font('Helvetica').fontSize(10);
    let sy = Math.max(160, sidebarBottomOfPhoto);
    sy = sidebarTitle('CONTACT', sy);
    const sw = sidebarWidth - 40;
    const sx = 20;
    if (cv.tel) { doc.text(cv.tel, sx, sy, { width: sw }); sy = doc.y + 6; }
    if (cv.email) { doc.text(cv.email, sx, sy, { width: sw }); sy = doc.y + 6; }
    if (cv.adresse) { doc.text(cv.adresse, sx, sy, { width: sw }); sy = doc.y + 6; }
    if (cv.city || cv.country) { doc.text([cv.city, cv.country].filter(Boolean).join(', '), sx, sy, { width: sw }); sy = doc.y + 6; }
    if (cv.linkedin) { doc.text(`LinkedIn: ${cv.linkedin}`, sx, sy, { width: sw }); sy = doc.y + 6; }
    if (cv.github) { doc.text(`GitHub: ${cv.github}`, sx, sy, { width: sw }); sy = doc.y + 6; }
    if (cv.website || cv.portfolio) { doc.text(cv.website || cv.portfolio, sx, sy, { width: sw }); sy = doc.y + 6; }

    if (cv.education && cv.education.length) {
      sy = sidebarTitle('ÉDUCATION', sy + 12);
      cv.education.slice(0, 3).forEach(ed => {
        const line = `${ed.diplome || ''}`;
        doc.font('Helvetica-Bold').text(line, sx, sy, { width: sw });
        sy = doc.y;
        if ( ed.ecole ) { doc.font('Helvetica').text(ed.ecole, sx, sy, { width: sw }); sy = doc.y; }
        const dates = `${ed.dateDebut ? new Date(ed.dateDebut).getFullYear() : ''} - ${ed.dateFin ? new Date(ed.dateFin).getFullYear() : ''}`;
        if (dates.trim() !== '-') { doc.text(dates, sx, sy, { width: sw }); sy = doc.y; }
        sy += 6;
      });
    }

    if (cv.skills && cv.skills.length) {
      sy = sidebarTitle('COMPÉTENCES', sy + 12);
      const list = cv.skills.slice(0, 12);
      list.forEach(skill => {
        doc.circle(sx + 3, sy + 6, 2).fillColor(color).fill();
        doc.fillColor(sidebarTextColor).text(skill, sx + 12, sy, { width: sw - 12 });
        sy = doc.y + 4;
      });
    }

    if (cv.hobbies && cv.hobbies.length) {
      sy = sidebarTitle('CENTRES D'INTÉRÊT', sy + 12);
      cv.hobbies.slice(0, 8).forEach(hobby => {
        doc.circle(sx + 3, sy + 6, 2).fillColor(color).fill();
        doc.fillColor(sidebarTextColor).text(hobby, sx + 12, sy, { width: sw - 12 });
        sy = doc.y + 4;
      });
    }
    doc.restore();

    doc.moveDown();
    doc.fillColor(textColor).fontSize(10).text("Généré automatiquement", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Erreur PDF :", error);
    res.status(500).json({ message: "Erreur lors de la génération du PDF" });
  }
};