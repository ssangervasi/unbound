export interface UserData {
	savedGames: SavedGame[]
	session: Session
	options: Options
}

export interface Options {
	fullscreen: 'off' | 'on'
	bindHints: 'off' | 'on'
	musicVolume: number
	effectsVolume: number
}

export type StoredUserData = Pick<UserData, 'savedGames' | 'options'>

export interface Session {
	savedGame?: SavedGame
	levels: LevelSession[]
	level?: LevelSession
	keyCounts?: KeyCounts
	disabledKeys?: number[]
}

export interface SavedGame {
	levels: LevelSession[]
	keyCounts: KeyCounts
	disabledKeys: number[]
	createdAt: number
	updatedAt: number
}

export type KeyCounts = Record<number, number>

export interface LevelSession {
	sceneName: string
	startedAt: number
	completedAt?: number
	collectables: Collectable[]
}

export interface Collectable {
	id: string
	collectedAt: number
}

export const createFromJSON = (userDataJSON: string): UserData => {
	const userData = createDefault()
	let parsed: any
	try {
		parsed = JSON.parse(userDataJSON)
	} catch (e) {
		console.warn('createFromJSON parse error:', { userDataJSON })
	}
	if (isStoredData(parsed)) {
		userData.savedGames = parsed.savedGames
		if ('options' in parsed && typeof parsed.options === 'object') {
			userData.options = {
				...userData.options,
				...parsed.options,
			}
		}
	}
	return userData
}

export const isStoredData = (maybeData: any): maybeData is StoredUserData =>
	(maybeData != null)
	&& typeof maybeData === 'object'
	&& 'savedGames' in maybeData
	&& Array.isArray(maybeData.savedGames)
	&& maybeData.savedGames.every((savedGame: any) => (
		[
			'levels',
			'createdAt',
			'updatedAt',
			'keyCounts',
			'disabledKeys',
		].every((key) => typeof savedGame === 'object' && key in savedGame)
	))

export const createDefault = (): UserData => ({
	savedGames: [],
	session: {
		levels: [],
		level: undefined,
		savedGame: undefined,
	},
	options: {
		fullscreen: 'on',
		bindHints: 'off',
		musicVolume: 75,
		effectsVolume: 75,
	},
})

export const newGame = (userData: UserData): SavedGame => {
	const now = Date.now()
	const savedGame = {
		levels: [],
		keyCounts: {},
		disabledKeys: [],
		createdAt: now,
		updatedAt: now,
	}

	saveGame(userData)
	writeSession(userData, savedGame)
	return savedGame
}

export const resumeGame = (userData: UserData, createdAt?: number): SavedGame | null => {
	saveGame(userData)
	const previousSave =
		createdAt
			? userData.savedGames.find(s => s.createdAt === createdAt)
			: maxBy(userData.savedGames, (s) => s.updatedAt)
	if (!previousSave) {
		return null
	}

	writeSession(userData, previousSave)
	return previousSave
}

const writeSession = (userData: UserData, previousSave: SavedGame): Session => {
	userData.session = {
		savedGame: previousSave,
		levels: [...previousSave.levels],
		keyCounts: { ...previousSave.keyCounts },
		disabledKeys: [...previousSave.disabledKeys],
	}
	return userData.session
}

export const saveGame = (userData: UserData): SavedGame | null => {
	const savedGame = userData.session.savedGame
	if (!savedGame) {
		return null
	}

	savedGame.updatedAt = Date.now()
	savedGame.levels = [...userData.session.levels]
	savedGame.keyCounts = { ...userData.session.keyCounts }
	savedGame.disabledKeys = [...(userData.session.disabledKeys || [])]

	const index = userData.savedGames.findIndex(s => s.createdAt === savedGame.createdAt)
	if (index === -1) {
		userData.savedGames.push(savedGame)
	} else {
		userData.savedGames[index] = savedGame
	}
	return savedGame
}

export const lastPlayedLevelName = (savedGame: SavedGame) =>
	maxBy(savedGame.levels, s => s.startedAt)?.sceneName

export const maxBy = <T, V>(
	collection: T[],
	callback: (entry: T, index: number) => V,
): T | undefined => {
	let maxEntry: T | undefined = undefined
	let maxCandidate: V | undefined = undefined
	collection.forEach((entry, index) => {
		const candidate = callback(entry, index)
		if (maxCandidate === undefined || maxCandidate < candidate) {
			maxEntry = entry
			maxCandidate = candidate
		}
	})
	return maxEntry
}

export const pushLevel = ({ session }: UserData, sceneName: string): LevelSession => {
	session.level = {
		sceneName,
		startedAt: Date.now(),
		collectables: [],
	}
	session.levels.push(session.level)
	return session.level
}

export const peekLevelName = (
	{ session: { levels } }: UserData,
	defaultName = '',
	depth = 0,
): string => {
	const index = levels.length - 1 - depth
	if (index < 0) {
		return defaultName
	}
	return levels[index].sceneName
}

export const completeLevel = ({ session }: UserData): LevelSession | null => {
	const { level } = session
	if (!level) {
		return null
	}
	level.completedAt = Date.now()
	session.level = undefined
	return level
}

export const isLevel = (sceneName: string): boolean => sceneName.startsWith('L_')

export const collect = (
	userData: UserData,
	collectableId: string,
): Collectable | null => {
	const { session: { level } } = userData
	if (!level) {
		return null
	}
	const existingCollectable = findCollectable(userData, collectableId)
	if (existingCollectable) {
		return existingCollectable
	}
	const newCollectable = {
		id: collectableId,
		collectedAt: Date.now(),
	}
	level.collectables.push(newCollectable)
	return newCollectable
}

export const findCollectable = (
	{ session }: UserData,
	collectableId: string,
): Collectable | undefined => {
	const existingCollectables =
		session.levels.filter(
			l => Boolean(l.completedAt),
		).map(
			l => l.collectables.find(
				c => c.id === collectableId,
			),
		).filter((c): c is Collectable => c !== undefined)
	return existingCollectables[0]
}

export const findCollectables = (
	{ session }: UserData,
	idPattern: RegExp,
): Collectable[] => {
	const results: Collectable[] = []
	session.levels.filter(
		l => Boolean(l.completedAt),
	).forEach(
		l =>
			l.collectables
				.filter(c => idPattern.test(c.id))
				.forEach(id => results.push(id)),
	)
	return results
}

export const incrementKeyCount = (
	{ session }: UserData,
	keyCode: number,
): number | null => {
	session.keyCounts = session.keyCounts || {}
	session.keyCounts[keyCode] = (session.keyCounts[keyCode] || 0) + 1
	return session.keyCounts[keyCode]
}

export const getTopKeys = (
	{ session: { keyCounts } }: UserData,
): number[] => {
	if (!keyCounts) {
		return []
	}
	const descendingEntries = Object.entries(keyCounts)
		.sort(([_1, c1], [_2, c2]) => c2 - c1)
	return descendingEntries.map(([k, _]) => Number.parseInt(k, 10))
}

export const isDisabled = (
	{ session: { disabledKeys } }: UserData,
	key: number,
): boolean => {
	if (!disabledKeys) {
		return false
	}
	return disabledKeys.includes(key)
}

export const disable = (
	{ session }: UserData,
	key: number,
): number[] => {
	if (!session.disabledKeys) {
		session.disabledKeys = []
	}
	if (!session.disabledKeys.includes(key)) {
		session.disabledKeys.push(key)
		session.keyCounts = {}
	}
	return session.disabledKeys
}

export const disabledCount = (
	{ session: { disabledKeys } }: UserData,
): number => {
	if (!disabledKeys) {
		return 0
	}
	return disabledKeys.length
}



declare var global: {
	exports: {}
	ssangervasi?: {
		userData?: {}
	}
}
global.ssangervasi = global.ssangervasi || {}
global.ssangervasi.userData = global.ssangervasi.userData || exports
