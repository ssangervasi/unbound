#!/usr/bin/env node
import { Command } from 'commander'

import { refactor, transformInstances } from './refactor'

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
			.command('haiku')
			.action(checkHaikus),
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

const moveIndicators = (cmd: Command) => {
	const result = refactor(
		gdProject => {
			transformInstances(
				gdProject, (gdInst) => {
					console.log(gdInst.name)
				}, /BindIndicator/,
			)
			return gdProject
		},
		{
			inPath: cmd.opts().path,
			readOnly: cmd.opts().readonly,
		},
	)
	console.log(result)
}

const moveObstaclesToBaseLayer = (cmd: Command) => {
	const result = refactor(
		gdProject => {
			transformInstances(
				gdProject, (gdInst) => {
					console.log(gdInst.name, gdInst.layer)
					gdInst.layer = ''
					gdInst.zOrder = 100
				}, /Obstacle/,
			)
			return gdProject
		},
		{
			inPath: cmd.opts().path,
			readOnly: cmd.opts().readonly,
		},
	)
	console.log(result)
}

const checkHaikus = (cmd: Command) => {
	refactor(
		gdProject => {
			const results: string[][] = []
			transformInstances(
				gdProject, (gdInst, gdLayout) => {
					const idVar = gdInst.initialVariables.find(({ name }) => name === 'Id')
					if (idVar) {
						results.push([gdLayout.name, idVar.value])
					} else {
						results.push([gdLayout.name, 'None'])
					}
				}, /^Haiku$/,
			)
			console.log(results)
		},
		{
			inPath: cmd.opts().path,
			readOnly: true,
		},
	)
}

main()
