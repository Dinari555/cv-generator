// Preset theme colors for CV styling
module.exports.PRESET_COLORS = {
  blue: '#2E86DE',
  red: '#D7263D',
  green: '#2ECC71',
  purple: '#7D3C98',
  orange: '#E67E22',
  teal: '#17A589',
  gray: '#566573'
};

module.exports.isHexColor = (value) => /^#([0-9A-Fa-f]{6})$/.test(value || '');

module.exports.THEME_PRESETS = {
  professional: { primaryColor: 'blue', accentColor: 'gray', mode: 'light' },
  modern: { primaryColor: 'purple', accentColor: 'teal', mode: 'light' },
  elegant: { primaryColor: 'green', accentColor: 'gray', mode: 'light' },
  vibrant: { primaryColor: 'orange', accentColor: 'red', mode: 'light' },
  night: { primaryColor: 'teal', accentColor: 'purple', mode: 'dark' }
};


