import { AABB } from "../../../math/aabb.js"
import { createPhysics } from "../../../math/utils.js"
import { Vector2D } from "../../../math/vector.js"
import * as Level from "../level.js"

// TODO stop it immediately, bad
import * as Const from "../../../editor/consts.js"
import { assert } from "../../../assert.js"

const margin = new Vector2D(Const.editor.margin, Const.editor.margin)
/**
 * @param {EditorLevelSet} levelSet
 * @returns {LevelSet}
*/
export function convertLevelSet(levelSet) {
    /** @type {LevelSet} */
    const out = {
        title: levelSet.title,
        difficulty: levelSet.difficulty,
        initialLevel: levelSet.initialLevel,
        levels: [],
        platforms: new Map()
    }

    for (const eLevel of levelSet.levels) {
        /** @type {Level} */
        const level = {
            platforms: [],
            initialPosition: Vector2D.fromObject(eLevel.initialPosition),
            letterMap: []
        }

        for (const p of eLevel.platforms) {
            const aabb = AABB.fromObject(p.AABB)
            aabb.pos.subtract(margin)

            console.log("portal?", p.behaviors.portal)
            const platform = {
                physics: {
                    next: createPhysics(aabb),
                    current: createPhysics(aabb),
                },
                id: p.id,
                behaviors: {
                    next: p.behaviors.next,
                    circuit: p.behaviors.circuit,
                    instagib: p.behaviors.instagib,
                    obstacle: p.behaviors.obstacle,
                    portal: p.behaviors.portal,
                    render: p.behaviors.render ? /** @type {Render} */({
                        type: "render",
                        renderX: 0,
                        renderY: 0,
                        renderWidth: 0,
                        renderHeight: 0,
                    }) : undefined
                },
            }

            level.platforms.push(platform)
            out.platforms.set(platform.id, platform)
        }

        eLevel.initialPosition = Vector2D.fromObject(eLevel.initialPosition)
        out.levels.push(level)
    }

    validateLevel(out)
    return out
}

/**
 * @param {LevelSet} levelSet
 */
export function validateLevel(levelSet) {
    for (const level of levelSet.levels) {
        for (const platform of level.platforms) {
            const portal = platform.behaviors.portal
            if (!portal) {
                continue
            }
            assert(!platform.behaviors.obstacle, "platform cannot be an obstacle", portal)
            assert(!platform.behaviors.next, "platform cannot be a next", portal)
            assert(!platform.behaviors.instagib, "platform cannot be a instagib", portal)

            const other = levelSet.platforms.get(portal.to)
            assert(!!other, "the to in the portal does not exist", portal)
            assert(!!other.behaviors.portal, "the portal is pointing to a non portal", portal, other)

            const len = portal.normal.magnitude()
            assert(Math.abs(1 - len) <= 0.001, "expected the portal to have a magnitude 1 normal vec", portal)
        }
    }
}
