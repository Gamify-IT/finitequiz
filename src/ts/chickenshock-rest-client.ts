import axios, { AxiosResponse } from "axios";

import config from "@/config";

import { IChickenshockConfiguration } from "@/ts/models";

export async function postChickenshockConfig(
  chickenshockConfig: IChickenshockConfiguration
): Promise<AxiosResponse> {
  return axios.post(
    `${config.apiChickenshockUrl}/configurations`,
    chickenshockConfig
  );
}

export async function getChickenshockConfig(
  id: string
): Promise<AxiosResponse> {
  return axios.get(`${config.apiChickenshockUrl}/configurations/${id}`);
}
