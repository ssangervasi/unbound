declare module 'gdevelop-js' {
	export interface GdProject {
		layouts: GdLayout[]
	}

	export interface GdLayout {
		instances: GdInstance[]
		layers: GdLayer[]
		name: string
		objects: GdObject[]
	}

	export interface GdInstance {
		angle: number
		customSize: boolean
		height: number
		layer: string
		locked: boolean
		name: string
		width: number
		x: number
		y: number
		zOrder: number
		numberProperties: Array<{
			name: string
			value: number
		}>
		stringProperties: Array<{
			name: string
			value: string
		}>
		initialVariables: Array<{
			name: string
			value: string
		}>
	}

	export interface GdLayer {
		name: string
		visibility: boolean
		cameras: GdCamera
	}

	export interface GdCamera { }

	export type GdObjectType = 'Sprite' | 'TextObject::Text' | 'TiledSpriteObject::TiledSprite'

	export interface GdObjectBase {
		height: number
		name: string
		tags: string
		texture: string
		type: GdObjectType
		width: number
		variables: any[]
		behaviors: Array<{
			name: string
			type: string
		}>
	}

	export interface GdObjectSprite extends GdObjectBase {
		type: 'Sprite'
		animations: Array<{
			name: string
			useMultipleDirections: boolean
			directions: any[]
		}>
	}

	export interface GdColor {
		r: number
		g: number
		b: number
	}

	export interface GdObjectText extends GdObjectBase {
		type: 'TextObject::Text'
		color: GdColor
		string: string
		font: string
		characterSize: number
	}

	export type GdObject = GdObjectSprite | GdObjectText
}