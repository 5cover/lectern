// Lectern owns the automatic JSX runtime used by decks. Re-exporting Preact's
// JSX namespace is required for TypeScript to type intrinsic elements.
export { Fragment, jsx, jsx as jsxDEV, jsxs } from 'preact/jsx-runtime'
export type { JSX } from 'preact/jsx-runtime'
