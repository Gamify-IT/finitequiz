import axios, { AxiosResponse } from "axios";

import config from "@/config";
import { GameResultDTO } from "@/ts/models";

/**
 * This file contains all needed REST-Methods
 */

export function getQuestions(configId: string): Promise<AxiosResponse> {
  return axios.get(
    `${config.apiBaseUrl}/configurations/` + configId + `/questions`
  );
}

export function postGameResult(
  gameResultDTO: GameResultDTO
): Promise<AxiosResponse> {
  return axios.post(`${config.apiBaseUrl}/results`, gameResultDTO);
}
