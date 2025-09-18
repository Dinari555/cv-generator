const express=require('express');
const router= express.Router();
const { getcv, getallcvs, creationcv, updatecv, deletecv, exportCV, previewCV } = require('../controllers/cvControllers');
const { body, param } = require('express-validator');
const { PRESET_COLORS, isHexColor, THEME_PRESETS } = require('../config/colors');

const validateId = [param('id').isMongoId().withMessage('ID invalide')];
const baseValidators = [
  body('nom').isString().trim().notEmpty(),
  body('prenom').isString().trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('tel').isString().trim().notEmpty(),
  body('skills').optional().isArray(),
  body('languages').optional().isArray(),
  body('hobbies').optional().isArray(),
  body('theme').optional().custom((val) => {
    if (!val) return true;
    if (val.preset && !Object.keys(THEME_PRESETS).includes(val.preset)) {
      throw new Error('theme.preset invalide');
    }
    if (val.primaryColor && !isHexColor(val.primaryColor) && !PRESET_COLORS[val.primaryColor]) {
      throw new Error('theme.primaryColor must be a hex (#RRGGBB) or preset name');
    }
    if (val.accentColor && !isHexColor(val.accentColor) && !PRESET_COLORS[val.accentColor]) {
      throw new Error('theme.accentColor must be a hex (#RRGGBB) or preset name');
    }
    if (val.mode && !['light','dark'].includes(val.mode)) {
      throw new Error('theme.mode must be light or dark');
    }
    return true;
  })
];

// List and create
router.get('/', getallcvs);
router.post('/', baseValidators, creationcv);

// Get single, update, delete
router.get('/:id', validateId, getcv);
router.put('/:id', validateId, updatecv);
router.delete('/:id', validateId, deletecv);

// Export PDF
router.get('/:id/export', validateId, exportCV);

// Preview PDF inline
router.get('/:id/preview', validateId, previewCV);
// Alternate order in path to avoid any edge matching issues
router.get('/preview/:id', validateId, previewCV);

module.exports=router;