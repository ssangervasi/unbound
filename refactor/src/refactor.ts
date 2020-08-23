import * as fs from 'fs'
import * as path from 'path'

import * as Gd from 'gdevelop-js'
import * as immer from 'immer'

export interface RefactorOptions {
	inPath: string
	readOnly: boolean
}
export interface RefactorResult {
	projectPath: string
	backupPath: string
}

export const refactor = (
	callback: (gdProject: Gd.GdProject) => Gd.GdProject | void | null,
	options: RefactorOptions,
): RefactorResult | null => {
	const projectPath = path.resolve(options.inPath)
	const backupPath = path.join(path.dirname(projectPath),
		`backup-${Date.now()}.${path.basename(projectPath)}`)

	const project: Gd.GdProject = JSON.parse(fs.readFileSync(projectPath).toString())
	const result = immer.produce(project, callback)
	if (result === null || options.readOnly) {
		return null
	}

	fs.copyFileSync(projectPath, backupPath)
	fs.writeFileSync(projectPath, JSON.stringify(
		result, null, 2,
	))

	return {
		projectPath,
		backupPath,
	}
}

/**
 * @param callback Mutate the object provided, or return null to delete it.
 * @param namePattern If present, filters the instances to transform.
 */
export const transformInstances = (
	project: Gd.GdProject,
	callback: (gdInst: Gd.GdInstance, gdLayout: Gd.GdLayout) => Gd.GdInstance | null | void,
	namePattern?: RegExp,
	layoutPattern?: RegExp,
) => {
	project.layouts.forEach(gdLayout => {
		if (layoutPattern && !layoutPattern.test(gdLayout.name)) {
			return
		}

		const imLayout = immer.createDraft(gdLayout)
		const originals = gdLayout.instances
		const transforms: Gd.GdInstance[] = []
		originals.forEach(gdInst => {
			if (namePattern && !namePattern.test(gdInst.name)) {
				transforms.push(gdInst)
				return
			}

			const result = immer.produce(
				gdInst,
				(imInst: Gd.GdInstance) => callback(imInst, imLayout),
			)
			// returning null removes the object.
			if (result === null) {
				return
			}
			transforms.push(result)
		})

		gdLayout.instances = transforms
	})
}