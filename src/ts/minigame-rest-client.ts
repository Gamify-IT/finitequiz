import axios, { AxiosResponse } from "axios";

import config from "@/config";
import { ITask } from "@/ts/models";

export async function getMinigames(
  courseId: number,
  worldIndex: number,
  dungeonIndex: number | undefined
): Promise<AxiosResponse> {
  if (dungeonIndex != undefined) {
    return axios.get(
      `${config.apiBaseUrl}/courses/${courseId}/worlds/${worldIndex}/dungeons/${dungeonIndex}/minigame-tasks`
    );
  } else {
    return axios.get(
      `${config.apiBaseUrl}/courses/${courseId}/worlds/${worldIndex}/minigame-tasks`
    );
  }
}

export async function putMinigame(
  courseId: number,
  worldIndex: number,
  dungeonIndex: number | undefined,
  minigame: ITask
): Promise<AxiosResponse> {
  if (!isNaN(<number>dungeonIndex)) {
    console.log(dungeonIndex);
    return axios.put(
      `${config.apiBaseUrl}/courses/${courseId}/worlds/${worldIndex}/dungeons/${dungeonIndex}/minigame-tasks/${minigame.index}`,
      minigame
    );
  } else {
    return axios.put(
      `${config.apiBaseUrl}/courses/${courseId}/worlds/${worldIndex}/minigame-tasks/${minigame.index}`,
      minigame
    );
  }
}
