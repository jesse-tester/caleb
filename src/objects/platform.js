import { assert } from "../assert.js";
import { AABB } from "../math/aabb.js";
import { Vector2D } from "../math/vector.js";

/** @param state {GameState}
*/
export function render(state) {
    const plats = state.platforms
    const ctx = state.ctx;

    for (const p of plats) {
        ctx.fillRect(p.renderX, p.renderY, p.renderWidth, p.renderHeight);
    }

    const lWalls = state.walls
    for (const w of lWalls) {
        ctx.fillRect(w.renderX, w.renderY, w.renderWidth, w.renderHeight);
        // TODO Letters
    }
}

let _id = 0;
/**
 * @param aabb {AABB}
 * @returns {Platform}
*/
export function createPlatform(aabb) {
    const id = _id++
    return {
        id,
        physics: {
            vel: new Vector2D(0, 0),
            acc: new Vector2D(0, 0),
            body: aabb,
        },
        renderX: 0,
        renderY: 0,
        renderWidth: 0,
        renderHeight: 0,
    };
}

/**
 * @param aabb {AABB}
 * @param letters {string[]}
 * @returns {LetteredWall}
*/
export function createLetteredWall(aabb, letters) {
    assert(aabb.width >= 1, "aabb width has to be at least 1", aabb)
    if (aabb.width === 1) {
        assert(letters.length === aabb.height, "letters.length must be equal to aabb.height", "letters", letters, "aabb", aabb);
    } else {
        assert(letters.length === aabb.height * 2, "if width of aabb is 2 or more, then letters.length === aabb.height * 2", "letters", letters, "aabb", aabb);
    }

    return {
        physics: {
            vel: new Vector2D(0, 0),
            acc: new Vector2D(0, 0),
            body: aabb,
        },
        letters: letters,
        renderX: 0,
        renderY: 0,
        renderWidth: 0,
        renderHeight: 0,
    };
}