/**
 * This file contains all needed REST-Methods
 */
import axios, { AxiosResponse } from "axios";
import config from "@/config";
import { GameResultDTO } from "@/ts/models";
import store from "@/store/index";



/**
 * Fetches the questions for a specific configuration ID.
 *
 * @param configId The unique configuration ID for the game setup.
 * @returns A promise that resolves to an AxiosResponse containing the questions.
 */
export function getQuestions(configId: string): Promise<AxiosResponse> {
  return axios.get(
    `${config.apiBaseUrl}/configurations/` + configId + `/questions`
  );
}

/**
 * Fetches the volume level for a specific configuration ID.
 *
 * @param configId The unique configuration ID for the game setup.
 * @returns A promise that resolves to an AxiosResponse containing the volume level data.
 */
export function getVolumeLevel(configId: string): Promise<AxiosResponse> {
  return axios.get(
    `${config.apiBaseUrl}/configurations/` + configId + '/volume'
  );
}

/**
 * Sends the game result to the backend server.
 *
 * @param gameResultDTO The data transfer object (DTO) containing the game result.
 * @returns A promise that resolves once the result has been successfully posted.
 */
export async function postGameResult(
  gameResultDTO: GameResultDTO 
): Promise<void> {
  console.log("Sending GameResultDTO to backend:", gameResultDTO); // Log the data being sent
  try {
    const response = await axios.post(`${config.apiBaseUrl}/results`, gameResultDTO);
    console.log("Received response from backend:", response.data); // Log the response from backend
    const returnedResult = fromDTO(response.data);
    store.commit('setScore', returnedResult.score);
    store.commit('setRewards', returnedResult.rewards);

  } catch (error) {
    console.error("Error sending GameResultDTO:", error); // Log any error
    throw error; // Rethrow the error to be handled by the caller
  }
}

/**
 * Converts the raw data from the server response into a GameResultDTO object.
 *
 * @param dto The raw data object returned from the backend.
 * @returns A GameResultDTO object populated with the server response data.
 */
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

/**
 * Fetches an image by its UUID.
 *
 * @param imageUUID The UUID of the image.
 * @returns A promise that resolves to an AxiosResponse containing the image.
 */
export function getImageByUUID(imageUUID: string): Promise<AxiosResponse> {
  return axios.get(`${config.apiBaseUrl}/configurations/${imageUUID}/images`);
}

