import * as UD from './userData'

const mockCollectables = (): UD.Collectable[] => ([
	{
		id: 'horse-tail',
		collectedAt: 105,
	},
	{
		id: 'cow-foot',
		collectedAt: 115,
	},
])

const mockLevels = (): UD.LevelSession[] => (
	[
		{
			sceneName: 'L_some_level',
			startedAt: 100,
			completedAt: 110,
			collectables: [mockCollectables()[0]],
		},
		{
			sceneName: 'L_another_level',
			startedAt: 110,
			completedAt: undefined,
			collectables: [mockCollectables()[1]],
		},
	]
)
const mockSavedGames = (): UD.SavedGame[] => (
	[
		{
			createdAt: 2,
			updatedAt: 20,
			levels: [mockLevels()[0]],
			keyCounts: {},
		},
		{
			createdAt: 100,
			updatedAt: 200,
			levels: mockLevels(),
			keyCounts: {},
		},
	]
)

const blankSaveMatcher = (resultSave: UD.SavedGame) => (
	{
		levels: [],
		createdAt: expect.any(Number),
		updatedAt: resultSave.createdAt,
	}
)

const mockSession = (): UD.Session => (
	{
		savedGame: mockSavedGames()[1],
		levels: [],
		level: undefined,
	}
)

describe('createDefault', () => {
	const result = UD.createDefault()

	it('has no saved games', () => {
		expect(result.savedGames).toEqual([])
	})

	it('has a blank session', () => {
		expect(result.session).toMatchObject<UD.Session>({
			levels: [],
			level: undefined,
			savedGame: undefined,
		})
	})
})

describe('createFromJSON', () => {
	it('handles invalid JSON', () => {
		const result = UD.createFromJSON('horx;ma-dorks')
		expect(result.savedGames).toEqual([])
		expect(result.session.levels).toEqual([])
	})

	it('handles valid JSON with invalid structure', () => {
		const result = UD.createFromJSON('0')
		expect(result.savedGames).toEqual([])
		expect(result.session.levels).toEqual([])
	})

	it('loads the saved games from valid JSON', () => {
		const validStored: UD.StoredUserData = {
			savedGames: mockSavedGames(),
		}
		const result = UD.createFromJSON(JSON.stringify(validStored))
		expect(result.savedGames).toEqual(validStored.savedGames)
		expect(result.session.levels).toEqual([])
	})
})

describe('newGame', () => {
	it('with default data populates the session', () => {
		const defaultData = UD.createDefault()
		const resultSave = UD.newGame(defaultData)
		expect(defaultData.session.savedGame).toBe(resultSave)
		expect(resultSave).toMatchObject(blankSaveMatcher(resultSave))
		expect(defaultData.savedGames).toEqual([])
	})

	it('with existing data pushes the existing save', () => {
		const originalGames = mockSavedGames()
		const existingData: UD.UserData = {
			savedGames: [originalGames[0]],
			session: {
				savedGame: originalGames[1],
				levels: [],
			},
		}
		const resultSave = UD.newGame(existingData)
		expect(existingData.session.savedGame).toBe(resultSave)
		expect(resultSave).toMatchObject(blankSaveMatcher(resultSave))
		expect(existingData.savedGames).toEqual(originalGames)
	})
})

describe('resumeGame', () => {
	it('finds the most recent save', () => {
		const mostRecentSave = {
			createdAt: 1,
			updatedAt: 30,
			levels: mockLevels(),
			keyCounts: {},
		}
		const existingData: UD.UserData = {
			savedGames: [
				{
					createdAt: 1,
					updatedAt: 20,
					levels: mockLevels(),
					keyCounts: {},
				},
				mostRecentSave,
				{
					createdAt: 1,
					updatedAt: 10,
					levels: mockLevels(),
					keyCounts: {},
				},
				{
					createdAt: 1,
					updatedAt: 1,
					levels: mockLevels(),
					keyCounts: {},
				},
			],
			session: {
				levels: [],
			},
		}
		const resultSave = UD.resumeGame(existingData)
		expect(existingData.session.savedGame).toBe(resultSave)
		expect(resultSave).toBe(mostRecentSave)
	})
})

describe('saveGame', () => {
	it('adds the session levels to the save', () => {
		const data: UD.UserData = {
			savedGames: [],
			session: {
				savedGame: {
					createdAt: 1,
					updatedAt: 5,
					levels: [
						{
							sceneName: 'L_1',
							startedAt: 1,
							completedAt: 2,
							collectables: [],
						},
					],
					keyCounts: {},
				},
				levels: [
					{
						sceneName: 'L_1',
						startedAt: 1,
						completedAt: 2,
						collectables: [],
					},
					{
						sceneName: 'L_2',
						startedAt: 3,
						completedAt: 4,
						collectables: [],
					},
					{
						sceneName: 'L_3',
						startedAt: 5,
						collectables: [],
					},
				],
			},
		}
		const savedGame = UD.saveGame(data)
		expect(savedGame).toBeTruthy()
		expect(data.savedGames[0]).toEqual({
			createdAt: 1,
			updatedAt: expect.any(Number),
			levels: [
				{
					sceneName: 'L_1',
					startedAt: 1,
					completedAt: 2,
					collectables: [],
				},
				{
					sceneName: 'L_2',
					startedAt: 3,
					completedAt: 4,
					collectables: [],
				},
				{
					sceneName: 'L_3',
					startedAt: 5,
					collectables: [],
				},
			],
		})
		expect(data.session).toEqual({
			level: undefined,
			levels: savedGame?.levels,
			savedGame,
		})
	})
})

describe('lastPlayedLevel', () => {
	it('returns undefined if no levels were played', () => {
		const lastPlayedName = UD.lastPlayedLevelName({
			...mockSavedGames()[0],
			levels: [],
		})
		expect(lastPlayedName).toBeUndefined()
	})

	it('finds the most recently started level', () => {
		const lastPlayedName = UD.lastPlayedLevelName({
			...mockSavedGames()[0],
			levels: [
				...mockLevels(),
				{
					sceneName: 'L_last_played',
					startedAt: 10000,
					collectables: [],
				},
				...mockLevels(),
			],
		})
		expect(lastPlayedName).toEqual('L_last_played')
	})
})

describe('pushLevel', () => {
	it('handles no active level', () => {
		const dataNoLevel = {
			savedGames: mockSavedGames(),
			session: mockSession(),
		}
		const newLevel = UD.pushLevel(dataNoLevel, 'some-scene')
		expect(dataNoLevel.session.level).toBe(newLevel)
		expect(dataNoLevel.session.levels[0]).toBe(newLevel)
		expect(newLevel).toMatchObject<UD.LevelSession>({
			sceneName: 'some-scene',
			startedAt: expect.any(Number),
			collectables: [],
		})
	})

	it('stores the active scene and creates the new one', () => {
		const startingLevel: UD.LevelSession = {
			sceneName: 'starting-scene',
			startedAt: 314,
			collectables: mockCollectables(),
		}
		const dataWithLevel = {
			savedGames: mockSavedGames(),
			session: {
				levels: [startingLevel],
				level: startingLevel,
			},
		}
		const newLevel = UD.pushLevel(dataWithLevel, 'some-scene')
		expect(dataWithLevel.session.level).toBe(newLevel)
		expect(newLevel).toMatchObject<UD.LevelSession>({
			sceneName: 'some-scene',
			startedAt: expect.any(Number),
			collectables: [],
		})
		expect(dataWithLevel.session.levels[0]).toBe(startingLevel)
		expect(dataWithLevel.session.levels[1]).toBe(newLevel)
	})
})

describe('peekLevelName', () => {
	it('handles empty list with defaults', () => {
		const dataNoLevels: UD.UserData = {
			savedGames: [],
			session: {
				levels: [],
				level: undefined,
				savedGame: mockSavedGames()[0],
			},
		}
		expect(UD.peekLevelName(dataNoLevels)).toEqual('')
		expect(UD.peekLevelName(dataNoLevels, 'the-default')).toEqual('the-default')
		expect(UD.peekLevelName(
			dataNoLevels, 'the-default', 99,
		)).toEqual('the-default')
	})

	it('returns the entry at the right depth', () => {
		const dataWithLevel: UD.UserData = {
			savedGames: [],
			session: {
				levels: [
					{
						sceneName: 'the-first-level',
						startedAt: 101,
						collectables: [],
					},
					{
						sceneName: 'the-last-level',
						startedAt: 271,
						collectables: [],
					},
				],
				level: undefined,
				savedGame: mockSavedGames()[0],
			},
		}
		expect(UD.peekLevelName(dataWithLevel)).toEqual('the-last-level')
		expect(UD.peekLevelName(dataWithLevel, 'the-default')).toEqual('the-last-level')
		expect(UD.peekLevelName(
			dataWithLevel, 'the-default', 1,
		)).toEqual('the-first-level')
		expect(UD.peekLevelName(
			dataWithLevel, 'the-default', 99,
		)).toEqual('the-default')
	})
})

describe('collect', () => {
	it('adds the collectable to the level session', () => {
		const levelWithoutCollectable: UD.LevelSession = {
			collectables: [],
			sceneName: 'L_collecty',
			startedAt: 1,
		}
		const data: UD.UserData = {
			savedGames: [],
			session: {
				levels: [levelWithoutCollectable],
				level: levelWithoutCollectable,
			},
		}
		const collectable = UD.collect(data, 'tasty-cheese')
		expect(collectable).toEqual({
			id: 'tasty-cheese',
			collectedAt: expect.any(Number),
		})
	})

	it('returns the an already collected item from the level', () => {
		const theCheese = {
			id: 'tasty-cheese',
			collectedAt: 420,
		}
		const levelWithCollectable: UD.LevelSession = {
			collectables: [theCheese],
			sceneName: 'L_collecty',
			startedAt: 1,
			completedAt: 500,
		}
		const data: UD.UserData = {
			savedGames: [],
			session: {
				levels: [
					...mockLevels(),
					levelWithCollectable,
				],
				level: levelWithCollectable,
			},
		}
		const collectable = UD.collect(data, 'tasty-cheese')
		expect(collectable).toEqual(theCheese)
	})

	it('ignores items for incomplete levels', () => {
		const theCheese = {
			id: 'tasty-cheese',
			collectedAt: 420,
		}
		const levelWithCollectable: UD.LevelSession = {
			collectables: [
				...mockCollectables(),
				theCheese,
			],
			sceneName: 'L_collecty',
			startedAt: 1,
		}
		const data: UD.UserData = {
			savedGames: [],
			session: {
				levels: [levelWithCollectable],
				level: {
					sceneName: 'L_collecty',
					collectables: [],
					startedAt: 1337,
				},
			},
		}
		const collectable = UD.collect(data, 'tasty-cheese')
		expect(collectable).toEqual({
			id: 'tasty-cheese',
			collectedAt: expect.any(Number),
		})
		expect(collectable?.collectedAt).not.toEqual(theCheese.collectedAt)
	})
})

describe('findCollectables', () => {
	it('gets em', () => {
		const levelWithCollectable: UD.LevelSession = {
			collectables: [
				{
					id: 'cheese_tasty',
					collectedAt: 420,
				},
				{
					id: 'poison_pill',
					collectedAt: 314,
				},
				{
					id: 'cheese_spicy',
					collectedAt: 217,
				},
			],
			sceneName: 'L_collecty',
			startedAt: 1,
			completedAt: 200,
		}
		const data: UD.UserData = {
			savedGames: [],
			session: {
				levels: [
					...mockLevels(),
					levelWithCollectable,
				],
				level: levelWithCollectable,
			},
		}
		const collectable = UD.findCollectables(data, /^cheese_/)
		expect(collectable).toEqual([
			{
				id: 'cheese_tasty',
				collectedAt: 420,
			},
			{
				id: 'cheese_spicy',
				collectedAt: 217,
			},
		])
	})
})


describe('updateKeyCounts', () => {
	it('defaults to zero', () => {
		const data: UD.UserData = {
			savedGames: [],
			session: mockSession(),
		}

		UD.updateKeyCounts(data, { 'a': 1, 'b': 0, 'Lef'})
	})
})