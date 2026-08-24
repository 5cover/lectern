// Re-export Preact's automatic JSX runtime so decks may set
// `jsxImportSource: "lectern"` if they prefer. Authoring with
// `jsxImportSource: "preact"` works identically (Preact is a dependency).
export { Fragment, jsx, jsx as jsxDEV, jsxs } from 'preact/jsx-runtime'
