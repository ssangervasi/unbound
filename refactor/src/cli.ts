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
	return cmd
}

const moveIndicators = (cmd: Command) => {
	const result = refactor(
		cmd.opts().path,
		gdProject => {
			transformInstances(
				gdProject, (gdInst) => {
					console.log(gdInst.name)
				}, /BindIndicator/,
			)
			return gdProject
		},
	)
	console.log(result)
}

const moveObstaclesToBaseLayer = (cmd: Command) => {
	const result = refactor(
		cmd.opts().path,
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
	)
	console.log(result)
}

const checkHaikus = (cmd: Command) => {
	refactor(
		cmd.opts().path,
		gdProject => {
			transformInstances(
				gdProject, (gdInst, gdLayout) => {
					const idVar = gdInst.initialVariables.find(({ name }) => name === 'Id')
					if (idVar) {
						console.log('Has id var', idVar.value)
					} else {
						console.log('No id var', gdLayout.name)
					}
				}, /^Haiku$/,
			)
			return gdProject
		},
	)
}

main()
