const express = require('express');
const { body } = require('express-validator');
const { suggestSkills, generateSummary, tailorForJob } = require('../controllers/assistController');

const router = express.Router();

router.post('/suggest-skills', [
  body('resume').optional().isString(),
  body('experience').optional().isArray(),
  body('targetRole').optional().isString()
], suggestSkills);

router.post('/generate-summary', [
  body('nom').optional().isString(),
  body('prenom').optional().isString(),
  body('years').optional().isNumeric(),
  body('topSkills').optional().isArray(),
  body('lastRole').optional().isString()
], generateSummary);

router.post('/tailor-for-job', [
  body('skills').isArray(),
  body('jobDescription').isString()
], tailorForJob);

module.exports = router;







