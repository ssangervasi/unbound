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
	collectables: Collectable[]
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
	&& 'savedGames' in maybeData
	&& Array.isArray(maybeData.savedGames)
	&& maybeData.savedGames.every((savedGame: any) => (
		[
			'levels',
			'collectables',
			'createdAt',
			'updatedAt',
		].every((key) => key in savedGame)
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
		collectables: [],
		createdAt: now,
		updatedAt: now,
	}
	if (userData.session.savedGame) {
		saveGame(userData, userData.session.savedGame)
	}
	userData.session.savedGame = savedGame
	return savedGame
}

export const resumeGame = (userData: UserData, createdAt?: number): SavedGame | null => {
	if (userData.session.savedGame) {
		saveGame(userData, userData.session.savedGame)
	}
	const previousSave =
		createdAt
			? userData.savedGames.find(s => s.createdAt == createdAt)
			: maxBy(userData.savedGames, (s) => s.updatedAt)
	if (!previousSave) {
		return null
	}
	userData.session.savedGame = previousSave
	return previousSave
}

export const saveGame = (userData: UserData, savedGame: SavedGame): SavedGame => {
	savedGame.updatedAt = Date.now()
	const index = userData.savedGames.findIndex(s => s.createdAt === savedGame.createdAt)
	if (index === -1) {
		userData.savedGames.push(savedGame)
	} else {
		userData.savedGames[index] = savedGame
	}
	return savedGame
}

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
	if (session.level) {
		session.levels.push(session.level)
	}
	session.level = {
		sceneName,
		startedAt: Date.now(),
		collectables: []
	}
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

export const completeLevel = ({ session: { level } }: UserData): LevelSession | null => {
	if (!level) {
		return null
	}
	level.completedAt = Date.now()
	return level
}

export const exportUserData = {
	completeLevel,
	createDefault,
	createFromJSON,
	isStoredData,
	newGame,
	peekLevelName,
	pushLevel,
	resumeGame,
	saveGame
}

declare var global: {
	exports: {}
	ssangervasi?: {
		userData?: typeof exportUserData
	}
}
global.ssangervasi = global.ssangervasi || {}
global.ssangervasi.userData = global.ssangervasi.userData || exportUserData
