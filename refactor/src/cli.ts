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

main()
