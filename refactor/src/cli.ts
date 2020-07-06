#!/usr/bin/env node
import { Command } from 'commander'

import { refactor, transformInstances } from './refactor'

const main = () => {
	const program = new Command()
	program
		.description('Woop')

	program
		.command('move-indicators')
		.option(
			'-p --path <string>',
			'Project path',
			'./unbound.json'
		)
		.action(moveIndicators)
		
	program.parse(process.argv)
}

const moveIndicators = (cmd: Command) => {
	const result = refactor(cmd.opts().path, gdProject => {
		transformInstances(
			gdProject, (gdInst) => {
				console.log(gdInst)
				return gdInst
			}, /BindIndicator/
		)
		return gdProject
	})
	console.log(result)
}

main()
