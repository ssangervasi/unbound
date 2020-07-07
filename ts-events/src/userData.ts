export interface UserData {
	savedGames: SavedGame[]
	session: Session
}

export type StoredUserData = Pick<UserData, 'savedGames'>

export interface Session {
	savedGame?: SavedGame
	levels: LevelSession[]
	level?: LevelSession
}

export interface SavedGame {
	levels: LevelSession[]
	createdAt: number
	updatedAt: number
}

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
		console.log('createFromJSON parse error:', { userDataJSON })
	}
	if (isStoredData(parsed)) {
		userData.savedGames = parsed.savedGames
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
		].every((key) => typeof savedGame === 'object' && key in savedGame)
	))

export const createDefault = (): UserData => ({
	savedGames: [],
	session: {
		levels: [],
		level: undefined,
		savedGame: undefined,
	},
})

export const newGame = (userData: UserData): SavedGame => {
	const now = Date.now()
	const savedGame = {
		levels: [],
		createdAt: now,
		updatedAt: now,
	}

	saveGame(userData)
	userData.session.savedGame = savedGame
	return savedGame
}

export const resumeGame = (userData: UserData, createdAt?: number): SavedGame | null => {
	saveGame(userData)
	const previousSave =
		createdAt
			? userData.savedGames.find(s => s.createdAt == createdAt)
			: maxBy(userData.savedGames, (s) => s.updatedAt)
	if (!previousSave) {
		return null
	}
	userData.session.savedGame = previousSave
	userData.session.levels = [...previousSave.levels]
	return previousSave
}

export const saveGame = (userData: UserData): SavedGame | null => {
	const savedGame = userData.session.savedGame
	if (!savedGame) {
		return null
	}

	savedGame.updatedAt = Date.now()
	savedGame.levels = [...userData.session.levels]

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
	callback: (entry: T, index: number) => V
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
		collectables: []
	}
	session.levels.push(session.level)
	return session.level
}

export const peekLevelName = (
	{ session: { levels } }: UserData,
	defaultName = '',
	depth = 0
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

declare var global: {
	exports: {}
	ssangervasi?: {
		userData?: {}
	}
}
global.ssangervasi = global.ssangervasi || {}
global.ssangervasi.userData = global.ssangervasi.userData || exports
