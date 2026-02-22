export const MathUtils = {
    getDistance: (obj1, obj2) => {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    findNearest: (from, targets, range = Infinity) => {
        let nearest = null;
        let minDist = range;
        for (const target of targets) {
            if (target.toRemove) continue;
            const dist = MathUtils.getDistance(from, target);
            if (dist < minDist) { minDist = dist; nearest = target; }
        }
        return nearest;
    },

    /** Distance from a point to a line segment. point, segStart, segEnd are { x, y }. */
    getDistanceToSegment: (point, segStart, segEnd) => {
        const ax = segStart.x;
        const ay = segStart.y;
        const bx = segEnd.x;
        const by = segEnd.y;
        const px = point.x;
        const py = point.y;
        const abx = bx - ax;
        const aby = by - ay;
        const apx = px - ax;
        const apy = py - ay;
        const ab2 = abx * abx + aby * aby;
        if (ab2 === 0) return Math.sqrt(apx * apx + apy * apy);
        let t = (apx * abx + apy * aby) / ab2;
        t = Math.max(0, Math.min(1, t));
        const qx = ax + t * abx;
        const qy = ay + t * aby;
        const dx = px - qx;
        const dy = py - qy;
        return Math.sqrt(dx * dx + dy * dy);
    },
};
