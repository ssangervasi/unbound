#!/usr/bin/env node
import { Command } from 'commander'
import * as immer from 'immer'

import * as Gd from 'gdevelop-js'
import { refactor, transformInstances, RefactorOptions, transformLayouts } from './refactor'
import { log } from './utils'

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
			.command('haikus')
			.action(assignHaikus),
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
		'./unbound.json',
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
							sourceLayers.push(Object.cloneDeep(gdLayer))
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
