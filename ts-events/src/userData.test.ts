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
			disabledKeys: [],
		},
		{
			createdAt: 100,
			updatedAt: 200,
			levels: mockLevels(),
			keyCounts: {
				420: 200,
			},
			disabledKeys: [420],
		},
	]
)

const blankSaveMatcher = (resultSave?: UD.SavedGame) => (
	{
		levels: [],
		createdAt: expect.any(Number),
		updatedAt: resultSave?.createdAt,
	}
)

const mockSession = (): UD.Session => (
	{
		savedGame: mockSavedGames()[1],
		levels: [],
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
			disabledKeys: [],
		}
		const existingData: UD.UserData = {
			savedGames: [
				{
					createdAt: 1,
					updatedAt: 20,
					levels: mockLevels(),
					keyCounts: {},
					disabledKeys: [],
				},
				mostRecentSave,
				{
					createdAt: 1,
					updatedAt: 10,
					levels: mockLevels(),
					keyCounts: {},
					disabledKeys: [],
				},
				{
					createdAt: 1,
					updatedAt: 1,
					levels: mockLevels(),
					keyCounts: {},
					disabledKeys: [],
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

	it('populates the session with save data', () => {
		const savedGame = {
			levels: mockLevels(),
			keyCounts: {
				420: 1,
				69: 69,
			},
			disabledKeys: [
				666,
				42,
			],
			createdAt: 1,
			updatedAt: 30,
		}
		const existingData: UD.UserData = {
			savedGames: [savedGame],
			session: {
				levels: [],
			},
		}

		UD.resumeGame(existingData)

		expect(existingData.session).toEqual({
			savedGame,
			levels: savedGame.levels,
			keyCounts: {
				420: 1,
				69: 69,
			},
			disabledKeys: [
				666,
				42,
			],
		})
	})
})

describe('newGame', () => {
	it('populates the session with save data', () => {
		const previousSave = {
			levels: mockLevels(),
			keyCounts: {
				420: 1,
				69: 69,
			},
			disabledKeys: [
				666,
				42,
			],
			createdAt: 1,
			updatedAt: 30,
		}
		const existingData: UD.UserData = {
			savedGames: [],
			session: {
				savedGame: previousSave,
				levels: mockLevels(),
				level: mockLevels()[0],
				keyCounts: {
					2: 4,
					8: 16,
				},
				disabledKeys: [420, 69],
			},
		}

		UD.newGame(existingData)

		expect(existingData.session).toMatchObject({
			savedGame: blankSaveMatcher(existingData.session.savedGame),
			levels: [],
			keyCounts: {},
			disabledKeys: [],
		})
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
					disabledKeys: [],
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
			keyCounts: {},
			disabledKeys: [],
		})
		expect(data.session).toEqual({
			level: undefined,
			levels: savedGame?.levels,
			savedGame,
		})
	})

	it('adds the key counts to the save', () => {
		const data: UD.UserData = {
			savedGames: [],
			session: {
				keyCounts: {
					69: 1,
					420: 12,
				},
				savedGame: {
					createdAt: 1,
					updatedAt: 5,
					levels: [],
					keyCounts: {},
					disabledKeys: [],
				},
				levels: [],
			},
		}
		const savedGame = UD.saveGame(data)
		expect(savedGame).toBeTruthy()
		expect(data.savedGames[0].keyCounts).toEqual({ 69: 1, 420: 12 })
	})

	it('adds disabled keys to the save', () => {
		const data: UD.UserData = {
			savedGames: [],
			session: {
				disabledKeys: [420, 69],
				savedGame: {
					createdAt: 1,
					updatedAt: 5,
					levels: [],
					keyCounts: {},
					disabledKeys: [],
				},
				levels: [],
				keyCounts: {},
			},
		}
		const savedGame = UD.saveGame(data)
		expect(savedGame).toBeTruthy()
		expect(data.savedGames[0].disabledKeys).toEqual([420, 69])
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

describe('incrementKeyCount', () => {
	it('defaults to zero', () => {
		const data: UD.UserData = {
			savedGames: [],
			session: mockSession(),
		}

		UD.incrementKeyCount(data, 70)

		UD.incrementKeyCount(data, 71)
		UD.incrementKeyCount(data, 71)

		UD.incrementKeyCount(data, 72)
		UD.incrementKeyCount(data, 72)
		UD.incrementKeyCount(data, 72)

		UD.incrementKeyCount(data, 100)
		UD.incrementKeyCount(data, 100)
		UD.incrementKeyCount(data, 100)
		UD.incrementKeyCount(data, 100)

		expect(data.session.keyCounts).toEqual({
			70: 1,
			71: 2,
			72: 3,
			100: 4,
		})
	})

	it('picks up previous values', () => {
		const data: UD.UserData = {
			savedGames: [],
			session: {
				levels: [],
				keyCounts: {
					69: 9,
					420: 100,
					1: 1,
				},
			},
		}

		UD.incrementKeyCount(data, 69)
		UD.incrementKeyCount(data, 420)
		UD.incrementKeyCount(data, 1)

		expect(data.session.keyCounts).toEqual({
			69: 10,
			420: 101,
			1: 2,
		})
	})
})

describe('getTopKeys', () => {
	it('returns keys in descending count order', () => {
		const data: UD.UserData = {
			savedGames: [],
			session: {
				levels: [],
				keyCounts: {
					3: 9,
					1: 100,
					7: 1,
					6: 2,
					5: 3,
					4: 4,
					2: 50,
				},
			},
		}

		expect(UD.getTopKeys(data)).toEqual([
			1,
			2,
			3,
			4,
			5,
			6,
			7,
		])
	})
})

describe('isDisabled', () => {
	const data: UD.UserData = {
		session: {
			...mockSession(),
			disabledKeys: [42, 666],
		},
		savedGames: [],
	}

	it('is true for a disabled key', () => {
		expect(UD.isDisabled(data, 666)).toBe(true)
	})

	it('is false for a not-disabled key', () => {
		expect(UD.isDisabled(data, 420)).toBe(false)
	})
})

describe('disable', () => {
	it('modifies the session', () => {
		const data: UD.UserData = {
			session: {
				levels: mockLevels(),
			},
			savedGames: [],
		}
		UD.disable(data, 69)
		expect(data.session.disabledKeys).toContain(69)
	})

	it('does not add duplicates', () => {
		const data: UD.UserData = {
			session: {
				...mockSession(),
				disabledKeys: [42, 666],
			},
			savedGames: [],
		}

		UD.disable(data, 666)
		UD.disable(data, 42)
		expect(data.session.disabledKeys).toEqual([42, 666])
	})
})