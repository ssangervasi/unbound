export interface UserData {
	savedGames: SavedGame[]
	session: Session
}

export type StoredUserData = Pick<UserData, 'savedGames'>

export interface Session {
	savedGame: SavedGame
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

export const createDefault = (): UserData => {
	const now = Date.now()
	return {
		savedGames: [],
		session: {
			levels: [],
			level: undefined,
			savedGame: {
				levels: [],
				collectables: [],
				createdAt: now,
				updatedAt: now,
			},
		},
	}
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
	createFromJSON,
	isStoredData,
	createDefault,
	pushLevel,
	peekLevelName,
	completeLevel,
}

declare var global: {
	exports: {}
	ssangervasi?: {
		userData?: typeof exportUserData
	}
}
global.ssangervasi = global.ssangervasi || {}
global.ssangervasi.userData = exportUserData
