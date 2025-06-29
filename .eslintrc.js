module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    es2021: true,
    node: true,
    browser: true,
  },
  plugins: ['react'],
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  rules: {
    'no-undef': 'error', // This will catch undefined variables like resetGame
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
  },
  settings: {
    react: { version: 'detect' },
  },
};