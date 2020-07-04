#!/usr/bin/env node
import { Command } from 'commander'

import { refactor } from './refactor'

const main = () => {
	const program = new Command()
	program
		.arguments('<SHOOP>')
		.description('Woop')
		.option(
			'-d --doop',
			'Doop',
			false
		)
		.action(action)
	program.parse(process.argv)
}

const action = (shoop: string, cmd: Command): void => {
	console.log(refactor(shoop, cmd.doop))
}

main()
