import type { Profile } from '@5cover/lectern'

/**
 * A house style defined outside lectern: same shape, same treatment as the
 * built-in `engie` profile. The stylesheet is resolved relative to this file.
 */
export const paper: Profile = {
  name: 'paper',
  label: 'Paper',
  description: 'Monochrome editorial style: serif titles, ink on off-white, one red accent, 4:3.',
  stylesheet: new URL('./paper.css', import.meta.url),
  reveal: {
    width: 1024,
    height: 768,
    center: true,
    margin: 0.04,
    slideNumber: true,
  },
  rules: [
    {
      title: 'Structure',
      rules: [
        { id: 'one-idea', statement: 'One idea per slide, stated in the title.', severity: 'should' },
        {
          id: 'no-bullets-on-cover',
          statement: 'The cover carries a title and a byline, nothing else.',
          severity: 'must',
        },
      ],
    },
    {
      title: 'Colours',
      rules: [
        {
          id: 'single-accent',
          statement: 'Red #c0392b is the only accent; use it once per slide at most.',
          severity: 'advisory',
        },
      ],
    },
  ],
}
