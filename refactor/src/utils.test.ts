import { dedent, dd } from './utils'

describe('dedent', () => {
	it('should remove leading spaces', () => {
		expect(
			dedent(`
      first line
      middle line
      last line
    `),
		).toBe(
			`first line
middle line
last line`,
		)
	})
	it('should preserve inner indent', () => {
		expect(
			dedent(`
      first line
        indented line
      last line
    `),
		).toBe(
			`first line
  indented line
last line`,
		)
	})
})

describe('dd template tag', () => {
	it('should remove leading spaces', () => {
		expect(dd`
      first line
      middle line
      last line
    `).toBe(
			`first line
middle line
last line`,
		)
	})
	it('should preserve inner indent', () => {
		expect(dd`
      first line
        indented line
      last line
    `).toBe(
			`first line
  indented line
last line`,
		)
	})
})
