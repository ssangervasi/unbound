export interface UserData {
	savedGames: SavedGame[]
	session: Session
}

export type StoredUserData = Pick<UserData, 'savedGames'>

export interface Session {
	savedGame: SavedGame
	scenes: SceneSession[]
	level?: LevelSession
}

export interface SavedGame {
	levels: LevelSession[]
	collectables: Collectable[]
	createdAt: number
	updatedAt: number
}

export interface SceneSession {
	sceneName: string
	startedAt?: number
	completedAt?: number
}

export interface LevelSession extends SceneSession {
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
			scenes: [],
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
