import * as userData from './userData'

const mockCollectables = (): userData.Collectable[] => ([
	{
		id: 'horse-tail',
		collectedAt: 105,
	},
	{
		id: 'cow-foot',
		collectedAt: 115,
	}
])

const mockLevels = (): userData.LevelSession[] => (
	[
		{
			sceneName: 'L_some_level',
			startedAt: 100,
			completedAt: 110,
			collectables: [mockCollectables()[0]]
		},
		{
			sceneName: 'L_another_level',
			startedAt: 110,
			completedAt: undefined,
			collectables: [mockCollectables()[1]]
		},
	]
)
const mockSavedGames = (): userData.SavedGame[] => (
	[
		{
			createdAt: 2,
			updatedAt: 20,
			levels: [mockLevels()[0]],
			collectables: []
		},
		{
			createdAt: 100,
			updatedAt: 200,
			levels: mockLevels(),
			collectables: [mockCollectables()[0]]
		},
	]
)

const mockSession = (): userData.Session => (
	{
		savedGame: mockSavedGames()[1],
		levels: [],
		level: undefined,
	}
)

describe('createDefault', () => {
	const result = userData.createDefault()

	it('has no saved games', () => {
		expect(result.savedGames).toEqual([])
	})

	it('has a blank session', () => {
		expect(result.session).toMatchObject<userData.Session>({
			levels: [],
			level: undefined,
			savedGame: expect.objectContaining({
				levels: [],
				collectables: [],
				createdAt: expect.any(Number),
				updatedAt: expect.any(Number),
			})
		})
	})
})

describe('createFromJSON', () => {
	it('handles invalid json', () => {
		const result = userData.createFromJSON('horx;ma-dorks')
		expect(result.savedGames).toEqual([])
		expect(result.session.savedGame.levels).toEqual([])
	})

	it('loads the saved games from valid JSON', () => {
		const validStored: userData.StoredUserData = {
			savedGames: mockSavedGames()
		}
		const result = userData.createFromJSON(JSON.stringify(validStored))
		expect(result.savedGames).toEqual(validStored.savedGames)
		expect(result.session.savedGame.levels).toEqual([])
	})
})

describe('pushLevel', () => {
	it('handles no active level', () => {
		const dataNoLevel = {
			savedGames: mockSavedGames(),
			session: mockSession()
		}
		const newLevel = userData.pushLevel(dataNoLevel, 'some-scene')
		expect(dataNoLevel.session.level).toBe(newLevel)
		expect(newLevel).toMatchObject<userData.LevelSession>({
			sceneName: 'some-scene',
			startedAt: expect.any(Number),
			collectables: []
		})
	})

	it('stores the active scene and creates the new one', () => {
		const startingLevel: userData.LevelSession = {
			sceneName: 'starting-scene',
			startedAt: 314,
			collectables: mockCollectables()
		}
		const dataWithLevel = {
			savedGames: mockSavedGames(),
			session: {
				...mockSession(),
				level: startingLevel
			}
		}
		const newLevel = userData.pushLevel(dataWithLevel, 'some-scene')
		expect(dataWithLevel.session.level).toBe(newLevel)
		expect(newLevel).toMatchObject<userData.LevelSession>({
			sceneName: 'some-scene',
			startedAt: expect.any(Number),
			collectables: []
		})
		expect(dataWithLevel.session.levels.slice(-1)[0]).toBe(startingLevel)
	})
})

describe('peekLevelName', () => {
	it('handles empty list with defaults', () => {
		const dataNoLevels: userData.UserData = {
			savedGames: [],
			session: {
				levels: [],
				level: undefined,
				savedGame: mockSavedGames()[0]
			}
		}
		expect(userData.peekLevelName(dataNoLevels)).toEqual('')
		expect(userData.peekLevelName(dataNoLevels, 'the-default')).toEqual('the-default')
		expect(userData.peekLevelName(
			dataNoLevels, 'the-default', 99
		)).toEqual('the-default')
	})

	it('returns the entry at the right depth', () => {
		const dataWithLevel: userData.UserData = {
			savedGames: [],
			session: {
				levels: [
					{
						sceneName: 'the-first-level',
						startedAt: 101,
						collectables: []
					},
					{
						sceneName: 'the-last-level',
						startedAt: 271,
						collectables: []
					}
				],
				level: undefined,
				savedGame: mockSavedGames()[0]
			}
		}
		expect(userData.peekLevelName(dataWithLevel)).toEqual('the-last-level')
		expect(userData.peekLevelName(dataWithLevel, 'the-default')).toEqual('the-last-level')
		expect(userData.peekLevelName(
			dataWithLevel, 'the-default', 1
		)).toEqual('the-first-level')
		expect(userData.peekLevelName(
			dataWithLevel, 'the-default', 99
		)).toEqual('the-default')
	})
})

