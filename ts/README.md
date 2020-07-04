# Shawn
Telefactor: Shawn - Reference implementation

Sean Connery, why don't you pick?
<https://youtu.be/8Zq3KCBed5Q?list=PLZfSCeE5MuigMa2Ahyd3pckdHCIuzJDFH&t=243>

## What do I do?

So you're thinking:

> I've got this code.
>
> I've run through the setup.
>
> Now, [what am I gonna do?](https://youtu.be/tpD00Q4N6Jk)

Well, you're either a _examiner_ or an _sourcerer_.

### Examiner

If you're an examiner then the `src/` directory should have a bunch of code in `.ts` files.
The `.test.ts` files, on the other hand, should be just about empty.

It's up to you to write tests in at least one file (`src/shawn.test.ts`) to validate
the behavior of the logic in `src/shawn.ts`.

Depending how confident you are with the implementation and your understanding
of how the app is "supposed" to work, you might add code which...

* Tests some behavior, and passes because the implementation works with it.
* Tests some behavior, but fails because the implementation doesn't work how you think it should.
* Doesn't test some behavior because it's just so obvious it works.
* Doesn't test some behavior it's impossible!

That's all the hints you get. So helpful, huh?

### Sourcerer

If you're sourcerer then the `src/` directory should have `.ts` files which are
just about empty. There should be some  `.test.ts` files, however, which contain
a bunch of failing tests (which probably don't even compile right now).

It's up to you to write source code in at least one file (`src/shawn.ts`) to make 
those tests pass.

Depending how confident you are with the tests and your understanding
of how the app is "supposed" to work, you might add code which...

* Implements some behavior, and passes the tests because they work together.
* Implements some behavior, but fails the tests because the tests don't work how you think they should.
* Doesn't implement some behavior because the tests don't call for it.
* Doesn't implement some behavior because it's impossible!

That's all the hints you get. The clock is ticking.

## Setup

### Clone the repo

I'm going to assume you're setup with Git & Github.
[Here's a starting guide, just in case.](https://help.github.com/en/github/getting-started-with-github).

The rest of this readme will refer the directory you cloned as `$TELEFACTOR_DIR`.

For example, you might set `TELEFACTOR_DIR=~/telefactor/shawn-01`

### Node

I recommend NVM: <http://nvm.sh>

Installation is pretty simple: it clones the NVM repo to `~/.nvm` and then
adds a line to your bash profile to source the NVM shell script.

However, **I always recommend inspecting random scripts from the internet before running them!**

Once you have that settled, `nvm install` should do the trick:

```sh
cd $TELEFACTOR_DIR
nvm install
# => Found [...]/.nvmrc' with version <v12.14.0>
# Time passess...
# => Now using node v12.14.0 (npm v6.13.4)
```

The next time you open a terminal, you'll need to activate the right node version:

```sh
cd $TELEFACTOR_DIR
nvm use
# => Found [...]/.nvmrc' with version <v12.14.0>
# => Now using node v12.14.0 (npm v6.13.4)
```

**If you don't want NVM**

You'll need to install a compatable node version.
Make sure you're using something that works with the version specified here:

```sh
cat $TELEFACTOR_DIR/.nvmrc
```

From here on out we're going to assume your Node version is ready to go.

### NPM

Let's download a bunch more stuff, shall we?

```sh
npm install
```

To check that worked, let's list what wersions we're werkin wit:

```sh
npm list commander ts-node jest 
# Should be something like:
#   ├── commander@4.0.1 
#   ├─┬ jest@24.9.0 
#   │ └─┬ jest-cli@24.9.0
#   │   └─┬ @jest/core@24.9.0
#   │     └─┬ @jest/reporters@24.9.0
#   │       └─┬ istanbul-reports@2.2.6
#   │         └─┬ handlebars@4.5.3
#   │           └─┬ uglify-js@3.7.2
#   │             └── commander@2.20.3 
#   ├── ts-node@8.1.0 
#   └─┬ tslint@5.16.0
#     └── commander@2.20.3 
```

### Build!

Ok, let's see if it works:

```sh
# One-off build
npm run build
# Constant recompilation of changed files
npm run watch
```

And then let's run the tests:

```sh
# One-off test
npm run test
# Constantly rerun tests on changed files
npm run test-watch
```


## Running the `shawn` CLI

This codebase produces a `shawn` command that takes a phrase and shawn-ifies it.

### Using the NPM script

The quickest way to demo the command is with the `cli` NPM script (defined in `package.json`):

```sh
npm run cli 'I see Sean steals sheep by the seashore.'
# => I shee Shawn shtealsh sheep by the sheashore.
npm run cli -- --help
# [help text]
```

**Notes**:

- This dynamically builds the source code, meaning your in-progres code in the  `src/`
	directory will be used.
- The command takes a single string argument, so put your input phrase
	in quotes. Othwerise only the first word will be processed.
- NPM wil try to steal any `--option` arguments. Putting ` -- ` first stops this.

### Installing the command

The *real* output of this codebase is a command that can be run directly.
You can install the command with this NPM script:

```sh
npm run install-shawn
# Time passes...

# Verify it worked:
which shawn
# => ~/.nvm/versions/node/v12.14.0/bin/shawn
```

This will perform a clean (slow) build and link the resulting `JavaScript`
executable into your Node environment.

Then we can run it like this:

```sh
shawn 'I see Sean steals sheep by the seashore.'
# => I shee Shawn shtealsh sheep by the sheashore.
shawn --help
# [help text]
```

**Notes**:

- The source code has been built, meaning your in-progres code in the  `src/` does not matter.
	You need to re-install to see changes.
- The command still takes a single string argument, so you still need your input phrase
	in quotes. Othwerise only the first word will be processed.
- NPM isn't involved anymore, so don't use ` -- `.

## Testing with Jest

This project is set up with [Jest](https://jestjs.io/)
and TypeScript support with [ts-jest](https://www.npmjs.com/package/ts-jest).

The `test` and `test-watch` scripts simply call Jest for you:

```sh
# One-off test
npm run test
# or
npx jest

# Constantly rerun tests on changed files
npm run test-watch
# or
npx jest --watch 
```

Jest is configured with `jest.config.js`, which you shouldn't need to modify.

## Where files go?

Source files should go in `$TELEFACTOR_DIR/src/` and should have the `.ts` file extension.

Test files should go next to their source files. The file names should match, with the `.ts`
extension replaced by `.test.ts` for the test file.

For example:

```
./src
	├── shawn.test.ts
	└── shawn.ts
```

... though examiners may add more `.test.ts` files and sourcerers may add more `.ts` files.


## Can I add dependencies?

That's up to you, I suppose. Just keep in mind that you want the dependencies to be added
to `package.json` so that the next person gets them installed during setup. The standard way
to do this is:

```sh
# For *build time* dependencies:
npm install --save-dev $PACKAGE_NAME

# For *runtime* dependencies:
npm install --save $PACKAGE_NAME
```

For this project you can technically get away with dumping everything in devDependencies,
but technically you should make a distinction between what is needed during dev
and what was is needed after the code is built.

### TypeScript doesn't like my dependency!

Uh-oh. Choose on of these options (sorted from best plan to worst plan):

1. Find a different package which has built-in type support.
2. See if someone cool has published `@types/$PACKAGE_NAME`.
3. Give up and don't add a dependency.
4. Add write your own type definitions it in `src/declarations.d.ts`

## Code Style & Lint

This project is set up to use ESLint with the typescript-eslint plugin.
I highly recommend you run it like this:

```sh
npm run lint
```

This will run on the correct files, use a cache to improve speed, automatically correct
errors where possible.

You can check out `.eslintrc.js` to see which rules have been custom configured.
If you prefer a different style, too bad. You can write the code in your own style,
but before you hand the project over to the next person I'm going to checkout the
original lint config and run autocorrect.

TLDR: Stop writing semicolons. That's what compilers are for.

## A note on imports and exports

TypeScript (and sorta JavaScript) is strict about what names can be imported from a module.
Here's a concrete example:

```typescript
// File: ./foo.ts

const foo = (times = 1) => {
	return repeat(times, 'foo')
}

const repeat = (times: number, toRepeat: string) => {
	return (new Array(times)).fill(toRepeat).join('-')
}

export {
	foo
}

// File: ./foo.test.ts

import { repeat } from './foo.ts'

test('repeat', () => {
	expect(repeat(2, 'horse')).toEqual('horse-horse')
})
```

This code won't compile. Do you see why?

The problem is that `foo.ts` doesn't export `repeat`, only `foo`. This means that we
can't test `repeat`, except indirectly through `foo`.

This raises some philosophical questions of whether we should test "private" methods
like this at all. But I think we know what Sean Connery would say about that. Instead,
let's go with a simple plan:

**If you're a sourcerer, export all your constants and types.**
Do it even if nothing is importing them yet.

**If you're an examiner, you may modify source code to add exports you want to test.**
This is the only case where you can modify source code.

## More documentation plz

- TypeScript: <https://www.typescriptlang.org/docs/home.html>
- JavaScript: MDN all the way! <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide>
- Node 12: <https://nodejs.org/dist/latest-v12.x/docs/api/>
- Jest: <https://jestjs.io/docs/en/using-matchers>
- ESLint: <https://eslint.org/docs/user-guide/configuring>

