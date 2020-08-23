#!/usr/bin/env node
import { Command } from 'commander'

import { refactor, transformInstances, RefactorOptions } from './refactor'
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

main()
