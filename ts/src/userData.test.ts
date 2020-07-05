import * as userData from './userData'

describe('createDefault', () => {
	const result = userData.createDefault()

	it('has no saved games', () => {
		expect(result.savedGames).toEqual([])
	})

	it('has a blank session', () => {
		expect(result.session).toMatchObject({
			scenes: [],
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
			savedGames: [
				{
					createdAt: 2,
					updatedAt: 20,
					levels: [{
						sceneName: 'some-scene',
						startedAt: 1,
						completedAt: 10,
						collectables: []
					}],
					collectables: []
				},
				{
					createdAt: 100,
					updatedAt: 200,
					levels: [
						{
							sceneName: 'some-scene',
							startedAt: 100,
							completedAt: 110,
							collectables: [{
								id: 'horse-tail',
								collectedAt: 105,
							}]
						},
						{
							sceneName: 'another-scene',
							startedAt: 110,
							completedAt: undefined,
							collectables: [{
								id: 'cow-foot',
								collectedAt: 115,
							}]
						},
					],
					collectables: [{
						id: 'horse-tail',
						collectedAt: 105,
					}]
				},
			]
		}
		const result = userData.createFromJSON(JSON.stringify(validStored))
		expect(result.savedGames).toEqual(validStored.savedGames)
		expect(result.session.savedGame.levels).toEqual([])
	})
})
