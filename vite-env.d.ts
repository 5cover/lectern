/** Raw Vite asset imports are the only asset-query form Lectern documents. */
declare module '*?raw' {
    const content: string
    export default content
}

/** Profile assets may be embedded by the library build for standalone decks. */
declare module '*.svg' {
    const source: string
    export default source
}
