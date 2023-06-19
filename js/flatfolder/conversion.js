import { M } from "./math.js";

export const X = {     // CONVERSION
    L_2_V_EV_EL: (L, eps) => {
        for (const l of L) {    // sort line's points by X then Y
            l.sort(([x1, y1], [x2, y2]) => {
                return (Math.abs(x1 - x2) < eps) ? (y1 - y2) : (x1 - x2);
            });
        }
        const I = L.map((_, i) => i);
        I.sort((i, j) => {      // sort first endpoint of lines by X then Y
            const [[x1, y1],] = L[i];
            const [[x2, y2],] = L[j];
            return (Math.abs(x1 - x2) < eps) ? (y1 - y2) : (x1 - x2);
        });
        const P = [];
        let crossings = [];
        for (const [i, idx] of I.entries()) {    // find line-line intersections
            const [a, b] = L[idx];
            P.push([a, idx]);
            P.push([b, idx]);
            for (const [k, X] of crossings.entries()) {
                const [[c, d], j] = X;
                const [x1, y1] = a;
                const [x2, y2] = d;
                if ((d[0] + eps) < a[0]) {
                    crossings[k] = undefined;
                } else {
                    const x = M.intersect([a, b], [c, d], eps);
                    if (x != undefined) {
                        P.push([x, idx]);
                        P.push([x, j]);
                    }
                    if (M.on_segment(a, b, c, eps)) { P.push([c, idx]); }
                    if (M.on_segment(a, b, d, eps)) { P.push([d, idx]); }
                    if (M.on_segment(c, d, a, eps)) { P.push([a, j]); }
                    if (M.on_segment(c, d, b, eps)) { P.push([b, j]); }
                }
            }
            const temp = [[[a, b], idx]];
            for (const line of crossings) {
                if (line != undefined) {
                    temp.push(line);
                }
            }
            crossings = temp;
        }
        P.sort(([[x1, y1], i1], [[x2, y2], i2]) => {
            return (Math.abs(x1 - x2) < eps) ? (y1 - y2) : (x1 - x2);
        });
        let curr = [P[0]];
        const compressed_P = [curr];
        for (const point of P) {
            const [p, i1] = curr[0];
            const [q, i2] = point;
            if (M.close(p, q, eps)) {
                curr.push(point);
            } else {
                curr = [point];
                compressed_P.push(curr);
            }
        }
        const V = compressed_P.map((ps) => ps[0][0]);
        // 2) Constructing map from edges to overlapping lines
        const LP = L.map(() => new Set());
        for (const [i, cP] of compressed_P.entries()) {
            for (const [, j] of cP) {
                LP[j].add(i);
            }
        }
        const edges = new Map();
        for (const [i, S] of LP.entries()) {
            const points_on_line = Array.from(S);
            const [a, b] = L[i];
            const dir = M.sub(b, a);
            points_on_line.sort((pk, qk) => {
                const dp = M.dot(dir, V[pk]);
                const dq = M.dot(dir, V[qk]);
                return dp - dq;
            });
            let prev = points_on_line[0];
            for (const [j, curr] of points_on_line.entries()) {
                if (j == 0) { continue; }
                const k = M.encode_order_pair([curr, prev]);
                const E = edges.get(k);
                if (E == undefined) {
                    edges.set(k, [i]);
                } else {
                    E.push(i);
                }
                prev = curr;
            }
        }
        // 3) separate into EV and EL
        const [EV, EL] = [[], []];
        for (const [k, E] of edges) {
            EV.push(M.decode(k));
            EL.push(E);
        }
        return [V, EV, EL];
    },
    V_EV_2_VV_FV: (V, EV) => {
        const adj = V.map(() => []);
        for (const [pi, qi] of EV) {
            adj[pi].push(qi);
            adj[qi].push(pi);
        }
        const VV = [];
        for (const [i, v0] of V.entries()) {
            const A = [];
            for (const vi of adj[i]) {
                A.push([vi, M.angle(M.sub(V[vi], v0))]);
            }
            A.sort(([v1, a1], [v2, a2]) => a1 - a2);
            VV.push(A.map(([v, a]) => v));
        }
        const FV = [];
        const seen = new Set();
        for (const [v1, A] of VV.entries()) {
            for (const v2 of A) {
                const key = M.encode([v1, v2]);
                if (!(seen.has(key))) {
                    seen.add(key);
                    const F = [v1];
                    let [i, j] = [v1, v2];
                    while (j != v1) {
                        F.push(j);
                        [i, j] = [j, M.previous_in_list(VV[j], i)];
                        seen.add(M.encode([i, j]));
                    }
                    if (F.length > 2) {
                        FV.push(F);
                    }
                }
            }
        }
        M.sort_faces(FV, V);
        FV.pop(); // remove outer face
        return [VV, FV];
    },
    V_FV_2_VV: (V, FV) => {
        const next = V.map(() => new Map());
        const prev = V.map(() => new Map());
        for (const [fi, V] of FV.entries()) {
            let [v1, v2] = [V[V.length - 2], V[V.length - 1]];
            for (const v3 of V) {
                next[v2].set(v1, v3);
                prev[v2].set(v3, v1);
                [v1, v2] = [v2, v3];
            }
        }
        const VV = V.map(() => []);
        for (const [i, Adj] of VV.entries()) {
            const v0 = next[i].keys().next().value;
            let [v, v_] = [v0, undefined];
            const v1 = prev[i].get(v0);
            if (v1 != undefined) {
                [v, v_] = [v1, prev[i].get(v)];
                while ((v_ != undefined) && (v_ != v0)) {
                    [v, v_] = [v_, prev[i].get(v_)];
                }
            }
            const start = v;
            Adj.push(start);
            v = next[i].get(v);
            while ((v != undefined) && (v != start)) {
                Adj.push(v);
                v = next[i].get(v);
            }
        }
        return VV;
    },
    V_VV_EV_EA_2_VK: (V, VV, EV, EA) => {
        const VVA_map = new Map();
        for (const [i, [v1, v2]] of EV.entries()) {
            const a = EA[i];
            VVA_map.set(M.encode([v1, v2]), a);
            VVA_map.set(M.encode([v2, v1]), a);
        }
        const VK = [];
        for (const [i, A] of VV.entries()) {
            const adj = [];
            let boundary = false;
            let [count_M, count_V, count_U] = [0, 0, 0];
            for (const j of A) {
                const a = VVA_map.get(M.encode([i, j]));
                if (a == "B") {
                    boundary = true;
                    break;
                }
                if (a == "V" || a == "M" || a == "U") {
                    adj.push(j);
                }
                if (a == "M") { ++count_M; }
                if (a == "V") { ++count_V; }
                if (a == "U") { ++count_U; }
            }
            if (boundary || (adj.length == 0)) {
                VK.push(0);
            } else if (
                ((count_U == 0) && (Math.abs(count_M - count_V) != 2)) ||
                (adj.length % 2 != 0)
            ) {                       // violates Maekawa
                VK.push(1);           // far from zero
            } else {
                const angles = adj.map(j => M.angle(M.sub(V[j], V[i])));
                angles.sort((a, b) => a - b);
                let kawasaki = 0;
                for (let j = 0; j < angles.length; j += 2) {
                    kawasaki += angles[j + 1] - angles[j];
                }
                VK.push(Math.abs(kawasaki - Math.PI));
            }
        }
        return VK;
    },
    V_VF_EV_EA_2_Vf_Ff: (V, FV, EV, EA) => {
        const EA_map = new Map();
        for (const [i, vs] of EV.entries()) {
            EA_map.set(M.encode_order_pair(vs), EA[i]);
        }
        const EF_map = new Map();
        for (const [i, F] of FV.entries()) {
            for (const [j, v1] of F.entries()) {
                const v2 = F[(j + 1) % F.length];
                EF_map.set(M.encode([v2, v1]), i);
            }
        }
        const Vf = V.map((p) => undefined);
        const seen = new Set();
        seen.add(0);                    // start search at face 0
        const [v1, v2,] = FV[0];        // first edge of first face
        for (const i of [v1, v2]) {
            Vf[i] = V[i];
        }            // [face, edge, len, parity]
        const Ff = new Array(FV.length);
        const queue = [[0, v1, v2, Infinity, true]];
        let next = 0;
        while (next < queue.length) {                   // Prim's algorithm to
            const [fi, i1, i2, l, s] = queue[next];     // traverse face graph
            Ff[fi] = !s;                                // over spanning tree
            next += 1;                                  // crossing edges of 
            const F = FV[fi];                           // maximum length
            const x = M.unit(M.sub(V[i2], V[i1]));
            const y = M.perp(x);
            const xf = M.unit(M.sub(Vf[i2], Vf[i1]));
            const yf = M.perp(xf);
            let vi = F[F.length - 1];
            for (const vj of F) {
                if (Vf[vj] == undefined) {
                    const v = M.sub(V[vj], V[i1]);
                    const dx = M.mul(xf, M.dot(v, x));
                    const dy = M.mul(yf, M.dot(v, y) * (s ? 1 : -1));
                    const vnew = M.add(M.add(dx, dy), Vf[i1]);
                    Vf[vj] = vnew;
                }
                const len = M.distsq(V[vi], V[vj]);
                const f = EF_map.get(M.encode([vi, vj]));
                const a = EA_map.get(M.encode_order_pair([vi, vj]));
                const new_s = (a == "M" || a == "V" || a == "U") ? !s : s;
                if ((f != undefined) && !seen.has(f)) {
                    queue.push([f, vj, vi, len, new_s]);
                    seen.add(f);
                    let prev = len;
                    for (let i = queue.length - 1; i > next; --i) {
                        const curr = queue[i - 1][3];   // O(n^2) but could be
                        if (curr < prev) {              // O(n log n)
                            [queue[i], queue[i - 1]] = [queue[i - 1], queue[i]];
                        } else {
                            break;
                        }
                        prev = curr;
                    }
                }
                vi = vj;
            }
        }
        for (const p of Vf) { if (p == undefined) { debugger; } }
        return [Vf, Ff];
    },
    EV_FV_2_EF: (EV, FV) => {
        const EV_map = new Map();
        for (const [i, V] of EV.entries()) {
            EV_map.set(M.encode(V), i);
        }
        const EF = EV.map(() => [undefined, undefined]);
        for (const [i, F] of FV.entries()) {
            for (const [j, v1] of F.entries()) {
                const v2 = F[(j + 1) % F.length];
                const ei = EV_map.get(M.encode_order_pair([v1, v2]));
                const c = (v2 < v1) ? 0 : 1;
                EF[ei][c] = i;
            }
        }
        for (const [i, F] of EF.entries()) {
            const c = (F[0] == undefined) ? 1 :
                ((F[1] == undefined) ? 0 : undefined);
            if (c != undefined) {
                EF[i] = [F[c]];
            }
        }
        return EF;
    },
};
