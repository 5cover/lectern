import type { ComponentChildren } from 'preact'
import { toChildArray } from 'preact'

/** Join truthy class names. */
export function cx(...parts: Array<string | false | null | undefined>): string {
    return parts.filter(Boolean).join(' ')
}

/** Normalize children into a flat array (drops null/boolean, keeps text). */
export function children(nodes: ComponentChildren) {
    return toChildArray(nodes)
}
