#!/usr/bin/env node
import { Command } from 'commander'
import * as immer from 'immer'

import * as Gd from 'gdevelop-js'
import { refactor, transformInstances, RefactorOptions, transformLayouts, transformObjects } from './refactor'
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
			.command('haiku-assign')
			.action(haikuAssign),
	)
	commonOptions(
		program
			.command('haiku-texts')
			.action(haikuTexts),
	)
	commonOptions(
		program
			.command('hint-containers')
			.action(populateHintContainers),
	)
	commonOptions(
		program
			.command('all-text')
			.action(allText),
	)
	commonOptions(
		program
			.command('talk-text')
			.action(talkText),
	)
	commonOptions(
		program
			.command('panel-sprite-stats')
			.action(panelSpriteStats),
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

const populateHintContainers = (cmd: Command) => {
	refactor(
		gdProject => {
			transformLayouts(
				gdProject, (gdLayout) => {
					log(gdLayout.name)
					const newIndicator = {
						angle: 0,
						customSize: true,
						height: 50,
						initialVariables: [],
						layer: 'UI',
						locked: false,
						name: 'BindHintsContainer',
						numberProperties: [],
						stringProperties: [],
						width: 50,
						x: 705,
						y: 60,
						zOrder: 225,
					}

					const existing = gdLayout.instances.find((gdInst) => gdInst.name === 'BindHintsContainer')
					if (existing) {
						log('already had hints')
						Object.assign(existing, newIndicator)
					} else {
						log('needed them')
						gdLayout.instances.push(newIndicator)
					}
				}, /^L_.+$/,
			)
			return gdProject
		},
		getCommonOptions(cmd),
	)
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
		layout: string
		texts: Array<{
			name: string
			text: string
			rates?: object
		}>
	}> = []

	const aggregates = {
		chars: 0,
		words: 0,
		wpm: 0,
		wpmd: 0,
		cps: 0,
		cpsd: 0,
		ft: 0,
	}

	refactor(
		gdProject => {
			transformLayouts(
				gdProject, (gdLayout) => {
					const result: typeof results[0] = {
						layout: gdLayout.name,
						texts: [],
					}
					gdLayout.objects.forEach((gdObj) => {
						if (gdObj.type !== 'TextObject::Text') { return }
						if (!gdObj.name.startsWith('T_')) { return }

						const stateText = gdObj.behaviors.find(b => b.type === 'srs_states::StateText')
						const rates = stateText ? {
							chars: gdObj.string.length,
							...pick(
								stateText,
								'WordsPerMinute',
								'CharactersPerSecond',
								'FullTime',
								'SkipRate',
							),
						} : undefined

						result.texts.push({
							name: gdObj.name,
							text: gdObj.string,
							rates: rates,
						})

						aggregates.words += gdObj.string.match(/\w+|\.{3}/g)?.length || 0
						aggregates.chars += gdObj.string.length
						if (rates?.WordsPerMinute) {
							aggregates.wpm += Number(rates?.WordsPerMinute)
							aggregates.wpmd += 1
						} else if (rates?.CharactersPerSecond) {
							aggregates.cps += Number(rates?.CharactersPerSecond)
							aggregates.cpsd += 1
						} else if (rates?.FullTime) {
							aggregates.ft += Number(rates?.FullTime)
						}
					})
					results.push(result)
				},
			)
		},
		{ ...getCommonOptions(cmd), readOnly: true },
	)

	log(JSON.stringify({
		results,
		aggregates,
		averages: {
			wpm: aggregates.wpm / aggregates.wpmd,
			cps: aggregates.cps / aggregates.cpsd,
		},
	}, null, 2))
}

const panelSpriteStats = (cmd: Command) => {
	const results: Array<{
		layout: string
		instances: any
		panelSprites: Array<{
			name: string
			bottomMargin: number
			height: number
			leftMargin: number
			rightMargin: number
			texture: string
			tiled: boolean
			topMargin: number
			width: number
		}>
	}> = []

	refactor(
		gdProject => {
			transformLayouts(
				gdProject, (gdLayout) => {
					const result: typeof results[0] = {
						layout: gdLayout.name,
						instances: [],
						panelSprites: [],
					}
					gdLayout.instances.forEach((gdObj) => {
						if (gdObj.name !== 'MenuPill_Inactive') { return }
						result.instances.push(
							pick(gdObj as any, 'name',
								'bottomMargin',
								'height',
								'leftMargin',
								'rightMargin',
								'texture',
								'tiled',
								'topMargin',
								'width'),
						)
					})
					gdLayout.objects.forEach((gdObj) => {
						if (gdObj.type !== 'PanelSpriteObject::PanelSprite') { return }
						result.panelSprites.push(
							pick(
								gdObj,
								'name',
								'bottomMargin',
								'height',
								'leftMargin',
								'rightMargin',
								'texture',
								'tiled',
								'topMargin',
								'width',
							),
						)
					})
					if (result.panelSprites.length) {
						results.push(result)
					}
				},
			)
		},
		{ ...getCommonOptions(cmd), readOnly: true },
	)

	log(JSON.stringify(results, null, 2))
}


const talkText = (cmd: Command) => {
	refactor(
		gdProject => {
			transformObjects(
				gdProject, (gdObj, gdLayout) => {
					if (gdObj.type !== 'TextObject::Text') {
						return
					}

					let voice: '' | 'meany' | 'friend' = ''
					if (gdObj.font.endsWith('Pixel-y14Y.ttf')) {
						voice = 'friend'
					} else if (gdObj.font.endsWith('StaticAgeHorizontalHold-yLWq.ttf')) {
						voice = 'meany'
					}
					if (voice === '') {
						log('No voice for font', gdObj.font)
						return
					}

					const existingIndex = gdObj.behaviors.findIndex((b) => b.type === 'srs_jukebox::TalkText')
					const newBehavior = {
						'name': 'TalkText',
						'type': 'srs_jukebox::TalkText',
						'Voice': voice,
					}
					if (existingIndex === -1) {
						gdObj.behaviors.push(newBehavior)
					} else {
						gdObj.behaviors[existingIndex] = newBehavior
					}
					log(`${gdLayout.name}.${gdObj.name} set ${newBehavior.Voice}`)


					const stateText = gdObj.behaviors.find(b => b.type === 'srs_states::StateText')
					if (!stateText) {
						return
					}
					stateText.FullTime = 0
					stateText.CharactersPerSecond = 0
					if (voice === 'meany') {
						stateText.WordsPerMinute = 110
					} else if (voice === 'friend') {
						stateText.WordsPerMinute = 140
					}
				},
				/^T_/,
			)
		},
		getCommonOptions(cmd),
	)
}

const haikuAssign = (cmd: Command) => {
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
				/^L_C.+$/,
			)
			log('before', before)
			log('after', after, after.length)

			transformInstances(
				gdProject, (gdInst) => {
					const [levelName, idValue] = after.shift() || [undefined, undefined]
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
				/^L_VictoryRoom$/,
			)
			log('remaining', after)
		},
		getCommonOptions(cmd),
	)
}

const haikuTexts = (cmd: Command) => {
	refactor(
		gdProject => {
			const results: object[] =[]

			transformObjects(
				gdProject, (gdObj, gdLayout) => {
					if (gdObj.type !== 'TextObject::Text') {
						return
					}
					results.push({
						layout: gdLayout.name,
						text: gdObj.string,
					})

					const stateText = gdObj.behaviors.find(b => b.type === 'srs_states::StateText')
					if (!stateText) {
						log(`${gdLayout.name} did not have StateText`)
						return
					}
					stateText.FullTime = 0
					stateText.CharactersPerSecond = 0
					stateText.WordsPerMinute = 80
				},
				/^Verse$/,
				/^H_.+$/,
			)
			log(JSON.stringify(results, null, 2))
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
