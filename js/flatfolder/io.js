import { M } from "./math.js";
import { X } from "./conversion.js";

export const IO = {    // INPUT-OUTPUT

    OPX_2_L: (doc) => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(doc, "text/xml");
        const opx_lines = Array.from(dom.getElementsByClassName("oripa.OriLineProxy"));
        const lines = [];
        const coords = ["x0", "x1", "y0", "y1"];
        const map = ["", "F", "M", "V"];
        for (const opx_line of opx_lines) {
            if (opx_line.nodeName == "object") {
                const line = new Map();
                for (const f of coords) {
                    line.set(f, 0);
                }
                line.set("type", 1);
                for (const node of opx_line.children) {
                    const property = node.getAttribute("property");
                    line.set(property, +node.firstElementChild.innerHTML);
                }
                const [x0, x1, y0, y1] = coords.map(c => line.get(c));
                const type = map[line.get("type")];
                lines.push([[x0, y0], [x1, y1], type]);
            }
        }
        return lines;
    },
    CP_2_L: (doc) => {
        const map = ["", "U", "M", "V", "F"];
        const L = doc.split("\n").map(line => {
            line = line.trim();
            const [a, x1, y1, x2, y2] = line.split(" ").map(t => t.trim());
            return [[+x1, +y1], [+x2, +y2], map[+a]];
        });
        while (L[L.length - 1][2] == "") {
            L.pop();
        }
        return L;
    },
    SVG_style_2_color: (sty) => {
        const pairs = sty.split(";");
        let color = "U";
        for (const pair of pairs) {
            const parts = pair.split(":");
            if (parts.length == 2) {
                const attr = parts[0].trim();
                const val = parts[1].trim();
                if (attr == "stroke") {
                    if (val == "red" || val == "#FF0000") {
                        color = "M";
                    } else if (val == "blue" || val == "#0000FF") {
                        color = "V";
                    } else if (val == "gray" || val == "#808080") {
                        color = "F";
                    }
                    break;
                }
            }
        }
        return color;
    },


    doc_type_2_V_VV_EV_EA_EF_FV: (doc, type, side) => {
        let V, VV, EV, EA, FV;
        if (type == "fold") {
            [V, EV, EA, VV, FV] = IO.FOLD_2_V_EV_EA_VV_FV(doc);
            if (V == undefined) { return []; }
        } else {
            let L, EL;
            if (type == "svg") { L = IO.SVG_2_L(doc); }
            else if (type == "cp") { L = IO.CP_2_L(doc); }
            else if (type == "opx") { L = IO.OPX_2_L(doc); }
            else {
                return [];
            }
            const eps = M.min_line_length(L) / M.EPS;

            [V, EV, EL] = X.L_2_V_EV_EL(L, eps);
            EA = EL.map(l => L[l[0]][2]);
        }
        V = M.normalize_points(V);
        const flip_EA = (EA) => {
            return EA.map((a) => (a == "M") ? "V" : ((a == "V") ? "M" : a));
        };
        const flip_Y = (V) => V.map(([x, y]) => [x, -y + 1]);
        const reverse_FV = (FV) => {
            for (const F of FV) {
                F.reverse();
            }
        };
        if (FV == undefined) {
            if (side == "+") {
                EA = flip_EA(EA);
            } else {
                V = flip_Y(V);
            }
            [VV, FV] = X.V_EV_2_VV_FV(V, EV);
        } else {
            if (M.polygon_area2(M.expand(FV[0], V)) < 0) {
                EA = flip_EA(EA);
                reverse_FV(FV);
            }
            if (document.getElementById("side").value == "-") {
                EA = flip_EA(EA);
                reverse_FV(FV);
                V = flip_Y(V);
            }
        }
        const EF = X.EV_FV_2_EF(EV, FV);
        for (const [i, F] of EF.entries()) {    // boundary edge assignment
            if (F.length == 1) {
                EA[i] = "B";
            }
        }
        return [V, VV, EV, EA, EF, FV];
    },
    doc_2_FOLD: (doc, ext) => {
        const [V, VV, EV, EA, EF, FV] = IO.doc_type_2_V_VV_EV_EA_EF_FV(doc, ext, "-")

        const VK = X.V_VV_EV_EA_2_VK(V, VV, EV, EA);
        const [Pf, Ff] = X.V_VF_EV_EA_2_Vf_Ff(V, FV, EV, EA);
        const Vf = M.normalize_points(Pf);
        return { V, Vf, VK, EV, EA, EF, FV, Ff };
    },
};
