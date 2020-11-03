#!/usr/bin/env node
import { Command } from 'commander'
import * as immer from 'immer'

import * as Gd from 'gdevelop-js'
import { refactor, transformInstances, RefactorOptions, transformLayouts } from './refactor'
import { log, pick } from './utils'

const main = () => {
	const program = new Command()
	program.description('Refactor a GDevelop project')
	commonOptions(
		program
			.command('move-indicators')
			.action(moveIndicators),
	)
	commonOptions(
		program
			.command('motbl')
			.action(moveObstaclesToBaseLayer),
	)
	commonOptions(
		program
			.command('z-tidy')
			.action(zTidy),
	)
	commonOptions(
		program
			.command('haikus')
			.action(assignHaikus),
	)
	commonOptions(
		program
			.command('all-text')
			.action(allText),
	)
	commonOptions(
		program
			.command('copy-layers <sourceScene> <destScene> <layerNames...>')
			.action(copyLayers),
	)
	program.parse(process.argv)
}

const commonOptions = (cmd: Command) => {
	cmd.option(
		'-p --path <string>',
		'Project path',
		'../unbound.json',
	)
	cmd.option(
		'-r --readonly',
		'Read only - no edit or backup',
	)
	return cmd
}

const getCommonOptions = (cmd: Command): RefactorOptions => ({
	inPath: cmd.opts().path,
	readOnly: cmd.opts().readonly,
})

const moveIndicators = (cmd: Command) => {
	const result = refactor(
		gdProject => {
			transformInstances(
				gdProject, (gdInst) => {
					log(gdInst.name)
				}, /BindIndicator/,
			)
			return gdProject
		},
		getCommonOptions(cmd),
	)
	log(result)
}

const moveObstaclesToBaseLayer = (cmd: Command) => {
	const result = refactor(
		gdProject => {
			transformInstances(
				gdProject, (gdInst) => {
					log(gdInst.name, gdInst.layer)
					gdInst.layer = ''
					gdInst.zOrder = 100
				}, /Obstacle/,
			)
			return gdProject
		},
		getCommonOptions(cmd),
	)
	log(result)
}

const zTidy = (cmd: Command) => {
	const result = refactor(
		gdProject => {
			transformInstances(
				gdProject, (gdInst, gdLayout) => {
					log(
						gdLayout.name,
						pick(gdInst, 'name', 'zOrder', 'layer'),
					)
					gdInst.zOrder = 100
					gdInst.layer = 'Objects'
				}, /Exit/,
			)
		},
		getCommonOptions(cmd),
	)
	log(result)
}

const allText = (cmd: Command) => {
	const results: Array<{
		layer: string
		texts: Array<{
			name: string
			text: string
		}>
	}> = []

	refactor(
		gdProject => {
			transformLayouts(
				gdProject, (gdLayout) => {
					const result: typeof results[0] = {
						layer: gdLayout.name,
						texts: [],
					} 
					gdLayout.objects.forEach((gdObj) => {
						if (gdObj.type !== 'TextObject::Text') { return }
						if (!gdObj.name.startsWith('T_')) { return }
						result.texts.push({
							name: gdObj.name,
							text: gdObj.string,
						})
					})
					results.push(result)
				},
			)
		},
		{ ...getCommonOptions(cmd), readOnly: true },
	)

	log(JSON.stringify(results, null, 2))
}


const assignHaikus = (cmd: Command) => {
	refactor(
		gdProject => {
			const before: string[][] = []
			const after: string[][] = []
			let haikuIndex = 0

			transformInstances(
				gdProject, (gdInst, gdLayout) => {
					let idVar = gdInst.initialVariables.find(({ name }) => name === 'Id')
					if (!idVar) {
						idVar = { name: 'Id', value: '' }
						gdInst.initialVariables.push(idVar)
					}
					before.push([gdLayout.name, idVar.value])
					idVar.value = `H_${haikuIndex.toString().padStart(2, '0')}`
					haikuIndex += 1
					after.push([gdLayout.name, idVar.value])
				},
				/^Haiku$/,
				/^L_.+$/,
			)
			log('before', before)
			log('after', after)

			transformInstances(
				gdProject, (gdInst) => {
					const [levelName, idValue] = after.pop() || [undefined, undefined]
					if (!(levelName && idValue)) {
						return
					}

					let idVar = gdInst.initialVariables.find(({ name }) => name === 'Id')
					if (!idVar) {
						idVar = { name: 'Id', value: '' }
						gdInst.initialVariables.push(idVar)
					}
					idVar.value = idValue

					let levelVar = gdInst.initialVariables.find(({ name }) => name === 'SourceLevel')
					if (!levelVar) {
						levelVar = { name: 'SourceLevel', value: '' }
						gdInst.initialVariables.push(levelVar)
					}
					levelVar.value = levelName
				},
				/^Haiku$/,
				/^M_VictoryRoom$/,
			)
		},
		getCommonOptions(cmd),
	)
}

const copyLayers = (sourceScene: string, destScene: string, layerNames: string[], cmd: Command) => {
	refactor(
		gdProject => {
			const sourceLayers: Gd.GdLayer[] = []

			transformLayouts(
				gdProject,
				gdLayout => {
					console.debug('found source', gdLayout.name)
					gdLayout
						.layers
						.filter(gdLayer => layerNames.includes(gdLayer.name))
						.forEach(gdLayer => {
							sourceLayers.push(immer.current(gdLayer))
						})
				},
				new RegExp(`^${sourceScene}$`),
			)

			console.debug('sourceLayers', JSON.stringify(sourceLayers))


			transformLayouts(
				gdProject,
				gdLayout => {
					console.debug('found dest', gdLayout.name)

					sourceLayers.forEach(sourceLayer => {
						const exists = gdLayout.layers.find(
							layoutLayer => layoutLayer.name === sourceLayer.name,
						)
						if (exists) {
							log(`Layer "${sourceLayer.name}" already exists in scene "${destScene}"`)
							return
						}

						gdLayout.layers.push(sourceLayer)
					})
				},
				new RegExp(`^${destScene}$`),
			)
		},
		getCommonOptions(cmd),
	)
}
main()
