cd $(dirname $BASH_SOURCE)/../refactor

./node_modules/.bin/ts-node --files ./src/cli.ts -p ../unbound.json "$@"