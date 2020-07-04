#!/usr/bin/env node
import { Command } from 'commander'

import { refactor, transformInstances } from './refactor'

const main = () => {
	const program = new Command()
	program
		.description('Woop')
		.option(
			'-p --path',
			'Project path',
			'./unbound.json'
		)

	program
		.command('move-indicators')
		.action(moveIndicators)
		
	program.parse(process.argv)
}

const moveIndicators = (cmd: Command) => {
	refactor(cmd.opts().path, gdProject => {
		transformInstances(gdProject, (gdInst) => {
			console.log(gdInst)
			return gdInst
		}, /BindIndicator/)
		return gdProject
	})
}

main()
