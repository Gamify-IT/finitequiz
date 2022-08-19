import axios, { AxiosResponse } from "axios";

import config from "@/config";
import { IArea } from "./models";

export async function getDungeon(
  courseId: number,
  worldIndex: number,
  dungeonIndex: number
): Promise<AxiosResponse> {
  return axios.get(
    `${config.apiBaseUrl}/courses/${courseId}/worlds/${worldIndex}/dungeons/${dungeonIndex}`
  );
}

export async function updateDungeon(
  courseId: number,
  worldIndex: number,
  dungeonIndex: number,
  dungeon: IArea
): Promise<AxiosResponse> {
  return axios.put(
    `${config.apiBaseUrl}/courses/${courseId}/worlds/${worldIndex}/dungeons/${dungeonIndex}`,
    dungeon
  );
}
