import { assert, never } from "../assert.js";
import * as Bus from "../bus.js"
import * as Utils from "./utils.js"
import { from2Vecs } from "../math/aabb.js";

export class PlatformControls extends HTMLElement {
    /** @type {HTMLElement} */
    controls = null

    /**
     * @param {Event} evt
     */
    change = (evt) => {
        if (evt.type === "resize" && this.lastPlatform) {
            this.moveControls(this.lastPlatform);
        }

        const target = /** @type {HTMLInputElement | null} */(evt.target)
        if (!target) {
            return
        }

        if (target.id === "obstacle" && evt.checked) {
            console.log("help?")
        }
    }

    /**
     * @type {EditorPlatform | null}
     */
    lastPlatform = null

    constructor() {
        super();
        // TODO can i have multiple of these??
        Bus.listen("show-platform", (platform) => this.revealControls(platform))
        Bus.listen("hide-platform", () => this.hideControls())
        Bus.listen("move-platform", (platform) => this.moveControls(platform))
        Bus.listen("release-platform", (platform) => this.save(platform))
        Bus.listen("resize", this.change);

        let template = /** @type {HTMLTemplateElement} */(document.getElementById("platform-controls"))
        assert(!!template, "unable to retrieve template")
        let templateContent = template.content;

        const shadowRoot = this.attachShadow({ mode: "closed" });
        shadowRoot.appendChild(templateContent.cloneNode(true));

        this.controls = shadowRoot.querySelector(".platform-controls");
    }

    /** @param {EditorPlatform} platform */
    revealControls(platform) {
        this.lastPlatform = platform
        this.controls.classList.add("show")
        this.moveControls(platform)
        for (const [_, v] of Object.entries(this.getControls())) {
            v.addEventListener("change", this.change)
        }
    }

    hideControls() {
        this.lastPlatform = null
        this.controls.classList.remove("show")
        for (const [_, v] of Object.entries(this.getControls())) {
            v.removeEventListener("change", this.change)
        }
    }

    /** @param {EditorPlatform} platform */
    moveControls(platform) {
        const pos = Utils.unproject(platform.state, platform.AABB.pos)
        this.controls.style.top = `${pos.y}px`
        this.controls.style.left = `${pos.x}px`
    }

    /** @param {EditorPlatform} platform */
    save(platform) {
        this.hideControls()
        console.log(this.values())
    }

    values() {
        const controls = this.getControls()
        const out = {}
        for (const [k, v] of Object.entries(controls)) {
            if (v.type === "checkbox") {
                out[k] = v.checked
            } else {
                out[k] = +v.value
            }
        }

        return out
    }

    /**
     * @returns {Record<string, HTMLInputElement>}
     */
    getControls() {
        return {
            obstacle: /** @type {HTMLInputElement} */this.controls.querySelector("#obstacle"),
            instagib: /** @type {HTMLInputElement} */this.controls.querySelector("#instagib"),
            circuit: /** @type {HTMLInputElement} */this.controls.querySelector("#circuit"),
            circuitStartX: /** @type {HTMLInputElement} */this.controls.querySelector("#circuit-sx"),
            circuitStartY: /** @type {HTMLInputElement} */this.controls.querySelector("#circuit-sy"),
            circuitEndX: /** @type {HTMLInputElement} */this.controls.querySelector("#circuit-ex"),
            circuitEndY: /** @type {HTMLInputElement} */this.controls.querySelector("#circuit-ey"),
            nextLevel: /** @type {HTMLInputElement} */this.controls.querySelector("#next-level"),
            nextLevelLevel: /** @type {HTMLInputElement} */this.controls.querySelector("#nl-id"),
            render: /** @type {HTMLInputElement} */this.controls.querySelector("#render"),
        };
    }
}

/**
 * @param {EditorState} state
 * @returns {EditorPlatform}
 */
export function createPlatform(state) {
    const start = state.selectedElements[0]
    const end = state.selectedElements[state.selectedElements.length - 1]

    return {
        state,

        selected: null,
        AABB: from2Vecs(start.pos, end.pos),
        behaviors: {},
        el: null,
    }
}

