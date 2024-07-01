import axios, { AxiosResponse } from "axios";

import config from "@/config";
import { GameResultDTO } from "@/ts/models";
import { useStore } from 'vuex';

const store = useStore();

/**
 * This file contains all needed REST-Methods
 */

export function getQuestions(configId: string): Promise<AxiosResponse> {
  return axios.get(
    `${config.apiBaseUrl}/configurations/` + configId + `/questions`
  );
}

export async function postGameResult(
  gameResultDTO: GameResultDTO
): Promise<void> {
  console.log("Sending GameResultDTO to backend:", gameResultDTO); // Log the data being sent
  try {
    const response = await axios.post(`${config.apiBaseUrl}/results`, gameResultDTO);
    console.log("Received response from backend:", response.data); // Log the response from backend
    const returnedResult = fromDTO(response.data);
    store.commit('setRewards', returnedResult.rewards)
  } catch (error) {
    console.error("Error sending GameResultDTO:", error); // Log any error
    throw error; // Rethrow the error to be handled by the caller
  }
}

export function fromDTO(dto: any): GameResultDTO {
  return new GameResultDTO(
    dto.configurationAsUUID,
    dto.correctAnsweredQuestions,
    dto.wrongAnsweredQuestions,
    dto.score,
    dto.questionCount,
    dto.timeSpent,
    dto.rewards);
}