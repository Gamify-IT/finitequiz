import { AxiosResponse } from "axios";

import { IArea } from "./models";
import { getWorld, updateWorld } from "./world-rest-client";
import { getDungeon, updateDungeon } from "./dungeon-rest-client";

export async function getArea(
  courseId: number,
  worldIndex: number,
  dungeonIndex: number | undefined
): Promise<AxiosResponse> {
  if (dungeonIndex == undefined) {
    return getWorld(courseId, worldIndex);
  } else {
    return getDungeon(courseId, worldIndex, dungeonIndex);
  }
}

export async function updateArea(
  courseId: number,
  worldIndex: number,
  dungeonIndex: number,
  area: IArea
): Promise<AxiosResponse> {
  if (dungeonIndex == 0) {
    return updateWorld(courseId, worldIndex, area);
  } else {
    return updateDungeon(courseId, worldIndex, dungeonIndex, area);
  }
}
