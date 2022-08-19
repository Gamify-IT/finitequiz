import { mount, VueWrapper, flushPromises } from "@vue/test-utils";
import mockAxios from "jest-mock-axios";
import router from "@/router/index";
import MinigameTasksView from "@/views/MinigameTasksView.vue";
import { ITask, Minigame, Task } from "@/ts/models";
import BootstrapVue3 from "bootstrap-vue-3";
import config from "@/config";

jest.mock("axios");

describe("MinigameTaskView.vue", () => {
  let wrapper: VueWrapper;
  const courseId = 1;
  const worldIndex = 1;
  let minigames: ITask[];
  beforeEach(async () => {
    jest.clearAllMocks();
    const minigameTasksResponse = {
      data: [
        new Task(
          "random uuid",
          1,
          Minigame.BUGFINDER,
          "random configurationId"
        ),
        new Task(
          "random uuid2",
          2,
          Minigame.CHICKENSHOCK,
          "random configurationId 2"
        ),
      ],
    };
    minigames = minigameTasksResponse.data;
    // response for GET /courses
    mockAxios.get.mockResolvedValueOnce(minigameTasksResponse);
    router.push(`/courses/${courseId}/worlds/${worldIndex}/minigames`);
    await router.isReady();
    wrapper = mount(MinigameTasksView, {
      global: {
        plugins: [router, BootstrapVue3],
      },
    });
  });
  test("MinigameTaskView displays all minigames", async () => {
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${config.apiBaseUrl}/courses/${courseId}/worlds/${worldIndex}/minigame-tasks`
    );

    await flushPromises();
    for (const minigame of minigames) {
      expect(wrapper.html()).toContain(minigame.index.toString());
    }
  });
});
