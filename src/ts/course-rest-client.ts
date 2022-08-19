import axios, { AxiosResponse } from "axios";

import config from "@/config";
import { CourseInitialData, ICourse } from "./models";

export async function getCourses(): Promise<AxiosResponse> {
  return axios.get(`${config.apiBaseUrl}/courses`);
}

export async function getCourse(id: number): Promise<AxiosResponse> {
  return axios.get(`${config.apiBaseUrl}/courses/${id}`);
}

export async function postCourse(
  initialData: CourseInitialData
): Promise<AxiosResponse> {
  return axios.post(`${config.apiBaseUrl}/courses/`, initialData);
}

export async function putCourse(course: ICourse): Promise<AxiosResponse> {
  return axios.put(`${config.apiBaseUrl}/courses/${course.id}`, course);
}
