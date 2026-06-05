import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        requestIdleCallback: 'readonly',
        performance: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        Math: 'readonly',
        Array: 'readonly',
        Object: 'readonly',
        String: 'readonly',
        Number: 'readonly',
        Boolean: 'readonly',
        RegExp: 'readonly',
        Date: 'readonly',
        JSON: 'readonly',
        Promise: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        lucide: 'readonly',
        Chart: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off'
    }
  }
];
