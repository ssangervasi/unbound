import * as fs from 'fs'
import * as path from 'path'

import * as Gd from 'gdevelop-js'
import { produce } from 'immer'

export interface RefactorResult {
	projectPath: string
	backupPath: string
}

export const refactor = (
	inPath: string,
	callback: (gdProject: Gd.GdProject) => Gd.GdProject | null,
): RefactorResult | null => {
	const projectPath = path.resolve(inPath)
	const backupPath = path.join(
		path.dirname(projectPath),
		`backup-${Date.now()}.${path.basename(projectPath, 'json')}` 
	)
	
	const project: Gd.GdProject = JSON.parse(fs.readFileSync(projectPath).toString())
	const result = produce(project, callback)
	if (result === null) {
		return null
	}

	fs.copyFileSync(projectPath, backupPath)
	fs.writeFileSync(projectPath, JSON.stringify(result, null, 2))

	return {
		projectPath,
		backupPath
	}
}

export const transformInstances = (
	project: Gd.GdProject,
	callback: (gdInst: Gd.GdInstance) => Gd.GdInstance | null,
	namePattern?: RegExp,
) => {
	project.layouts.forEach(gdLayout => {
		const originals = gdLayout.instances
		const transforms: Gd.GdInstance[] = []
		originals.forEach(gdInst => {
			const isMatch = (!namePattern) || namePattern.test(gdInst.name)
			if (!isMatch) {
				transforms.push(gdInst)
				return
			}

			const result = produce(gdInst, callback)
			if (result !== null) {
				transforms.push(result)
			}
		})

		gdLayout.instances = transforms
	});
}