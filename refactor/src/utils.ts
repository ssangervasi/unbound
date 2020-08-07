export const log = (...args: any[]) => console.log(...args)

export const dedent = (multilineStr: string): string => {
	const leadingIndentRE = /^([ \t]+)(?=\w)/m
	const leadingIndentMatch = leadingIndentRE.exec(multilineStr)
	const leadingIndent = leadingIndentMatch ? leadingIndentMatch[1] : ''
	const indentedLines = multilineStr.split(/\n/)
	const lastIndex = indentedLines.length - 1
	const fixedLines = indentedLines.map((line, index) => {
		const isBlank = !/\S/.test(line)
		const isFirstLine = index === 0
		const isLastLine = index === lastIndex

		// Always strip first and last lines if they are blank.
		if (isBlank && (isFirstLine || isLastLine)) {
			return undefined
		} else if (line.startsWith(leadingIndent)) {
			return line.slice(leadingIndent.length)
		}
		return line
	})
	// Filter any undefined entries.
	return fixedLines.filter(l => l != null).join('\n')
}

/**
 * Handy alias for use as string template:
 * 	dd`
 * 		some
 * 			indendted
 * 		${stuff}
 *  `
 */
export const dd = (...args: Parameters<(typeof String)['raw']>) => {
	return dedent(String.raw(...args))
}
