// @flow

export default class Check {
  static pointInRange(point: atom$PointObject, range: atom$RangeObject): boolean {
    return Check.comparePoints(point, range.start) != -1 && Check.comparePoints(point, range.end) != 1;
  }

  static comparePoints(pointA: atom$PointObject, pointB: atom$PointObject): number {
    if (pointA.row > pointB.row) return 1;
    if (pointA.row < pointB.row) return -1;
    if (pointA.column > pointB.column) return 1;
    if (pointA.column < pointB.column) return -1;
    return 0;
  }
}
