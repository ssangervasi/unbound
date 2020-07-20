import * as fs from 'fs'
import * as path from 'path'
import * as immer from 'immer'

import * as Gd from 'gdevelop-js'

immer.enablePatches()

export interface RefactorResult {
	projectPath: string
	backupPath: string
}

export const refactor = (inPath: string,
	callback: (gdProject: Gd.GdProject) => Gd.GdProject | null | void): RefactorResult | null => {
	const projectPath = path.resolve(inPath)
	const backupPath = path.join(path.dirname(projectPath),
		`backup-${Date.now()}.${path.basename(projectPath)}`)

	const project: Gd.GdProject = JSON.parse(fs.readFileSync(projectPath).toString())

	const [result, patches] = immer.produceWithPatches(project, callback)
	// Only write a new file and backup if the project has ben modified.
	console.log('patches', patches)
	if (result === null || (patches.length < 1)) {
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
) => {
	project.layouts.forEach(gdLayout => {
		const imLayout = immer.createDraft(gdLayout)
		const originals = gdLayout.instances
		const transforms: Gd.GdInstance[] = []
		originals.forEach(gdInst => {
			const isMatch = (!namePattern) || namePattern.test(gdInst.name)
			if (!isMatch) {
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