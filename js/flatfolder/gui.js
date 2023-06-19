import { M } from "./math.js";
import { SVG } from "./svg.js";

export const GUI = {   // INTERFACE
    WIDTH: 1,
    COLORS: {
        background: "lightgray",
        active: "yellow",
        B: "lightskyblue",
        TE: ["green", "red", "orange", "cyan"],
        TF: ["lightgreen", "lightpink", "lightorange", "lightskyblue"],
        edge: {
            U: "black",
            F: "lightgray",
            M: "blue",  // crease pattern is
            V: "red",   // rendered white-side up
            B: "black",
        },
        face: {
            top: "gray",
            bottom: "white",
        },
        rand: ["lime", "red", "blue", "green", "aqua", "orange", "pink",
            "purple", "brown", "darkviolet", "teal", "olivedrab", "fuchsia",
            "deepskyblue", "orangered", "maroon", "yellow"],
    },

    update_flat: ($flat, FOLD) => {
        const name = $flat.getAttribute("id")
        const { V, VK, EV, EA, FV } = FOLD;
        const F = FV.map(f => M.expand(f, V));
        SVG.draw_polygons($flat, F, {
            id: name + "_f", fill: GUI.COLORS.face.bottom
        });
        SVG.append("g", $flat, { id: name + "_shrunk" });
        const K = [];
        const eps = 1 / M.EPS;
        for (const [i, k] of VK.entries()) {
            if (k > eps) { K.push(V[i]); }
        }
        SVG.draw_points($flat, K, { id: name + "_check", fill: "red", r: 10 });
        const lines = EV.map(l => M.expand(l, V));
        const colors = EA.map(a => GUI.COLORS.edge[a]);
        const creases = [];
        const edges = [];
        for (const [i, a] of EA.entries()) {
            if (a == "F") {
                creases.push(i);
            } else {
                edges.push(i);
            }
        }
        SVG.draw_segments($flat, creases.map(i => lines[i]), {
            id: name + "_e_flat", stroke: creases.map(i => colors[i]),
            stroke_width: GUI.WIDTH
        });
        SVG.draw_segments($flat, edges.map(i => lines[i]), {
            id: name + "_e_folded", stroke: edges.map(i => colors[i]),
            stroke_width: GUI.WIDTH
        });

    },
};
