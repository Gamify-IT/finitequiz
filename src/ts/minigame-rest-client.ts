import axios, { AxiosResponse } from "axios";

import config from "@/config";

export function getQuestions(configId: string): Promise<AxiosResponse> {
  return axios.get(
    `${config.apiBaseUrl}/configurations/` + configId + `/questions`
  );
}
