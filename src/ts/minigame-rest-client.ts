import axios, { AxiosResponse } from "axios";

import config from "@/config";

export async function getQuestions(configId: string) {
  if (configId != undefined) {
    return await axios.get(
      `${config.apiBaseUrl}/configurations/` + configId + `/questions`
    );
  }
}
