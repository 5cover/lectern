/** Raw Vite asset imports are the only asset-query form Lectern documents. */
declare module '*?raw' {
    const content: string
    export default content
}
