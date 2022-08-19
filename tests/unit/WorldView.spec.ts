import { mount, VueWrapper, flushPromises } from "@vue/test-utils";
import mockAxios from "jest-mock-axios";
import router from "@/router/index";
import WorldView from "@/views/WorldView.vue";
import { Dungeon, IWorld, World } from "@/ts/models";
import BootstrapVue3, {
  BFormCheckbox,
  BTableSimple,
  BTbody,
  BTd,
  BTr,
} from "bootstrap-vue-3";
import config from "@/config";

jest.mock("axios");

describe("WorldView.vue", () => {
  let wrapper: VueWrapper;
  const courseId = 1;
  let world: IWorld;
  beforeEach(async () => {
    jest.clearAllMocks();
    const worldResponse = {
      data: new World(
        "random uuid",
        1,
        "Static Name",
        "Topic Name",
        true,
        [
          new Dungeon(
            "random dungeon uuid",
            1,
            "Dungeon Static Name",
            "Dungeon Topic Name",
            false,
            [],
            []
          ),
        ],
        [],
        []
      ),
    };
    world = worldResponse.data;
    // response for GET /courses
    mockAxios.get.mockResolvedValueOnce(worldResponse);
    router.push(`/courses/${courseId}/worlds/${world.index}`);
    await router.isReady();
    wrapper = mount(WorldView, {
      global: {
        plugins: [router, BootstrapVue3],
      },
    });
  });
  test("WorldView displays table correctly", async () => {
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${config.apiBaseUrl}/courses/${courseId}/worlds/${world.index}`
    );

    await flushPromises();
    const table = wrapper.findComponent(BTableSimple);
    expect(table.exists()).toBe(true);

    const tableBody = table.findComponent(BTbody);
    expect(tableBody.exists()).toBe(true);
    const tableRows = tableBody.findAllComponents(BTr);
    expect(tableRows.length).toBe(1 + world.dungeons.length);

    // check world data
    const worldRow = tableRows[0];
    const worldColumns = worldRow.findAllComponents(BTd);
    expect(worldColumns[0].text()).toContain(world.staticName);
    expect(worldColumns[1].text()).toContain(world.topicName);
    const worldActiveSwitch = worldColumns[2].findComponent(BFormCheckbox);
    expect(worldActiveSwitch.exists()).toBe(true);

    // check dungeons data
    let rowIndex = 1;
    for (const dungeon of world.dungeons) {
      const dungeonRow = tableRows[rowIndex];
      const dungeonColumns = dungeonRow.findAllComponents(BTd);
      expect(dungeonColumns[0].text()).toContain(dungeon.staticName);
      expect(dungeonColumns[1].text()).toContain(dungeon.topicName);
      const dungeonActiveSwitch =
        dungeonColumns[2].findComponent(BFormCheckbox);
      expect(dungeonActiveSwitch.exists()).toBe(true);
      rowIndex++;
    }
  });
});
