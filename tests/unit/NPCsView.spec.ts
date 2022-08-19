import { mount, VueWrapper, flushPromises } from "@vue/test-utils";
import mockAxios from "jest-mock-axios";
import router from "@/router/index";
import NPCView from "@/views/NPCsView.vue";
import { Dungeon, INPC, NPC, World } from "@/ts/models";
import BootstrapVue3 from "bootstrap-vue-3";
import config from "@/config";

jest.mock("axios");

describe("NPCsView.vue", () => {
  let wrapper: VueWrapper;
  const courseId = 1;
  const worldIndex = 1;
  let npcs: INPC[];
  beforeEach(async () => {
    jest.clearAllMocks();
    /*const npcsResponse = {
      data: [
        new NPC("random uuid", 1, ["I am a NPC", "I give you a task"]),
        new NPC("random uuid 2", 2, [
          "I hope you met my ohter NPC friend before",
        ]),
      ],
    };
    npcs = npcsResponse.data;
    // response for GET /courses
    mockAxios.get.mockResolvedValueOnce(npcsResponse);   
    */
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
        [
          new NPC("random uuid", 1, ["I am a NPC", "I give you a task"]),
          new NPC("random uuid 2", 2, [
            "I hope you met my ohter NPC friend before",
          ]),
        ]
      ),
    };
    npcs = worldResponse.data.npcs;

    // response for GET /courses
    mockAxios.get.mockResolvedValueOnce(worldResponse);
    router.push(`/courses/${courseId}/worlds/${worldIndex}/npcs`);
    await router.isReady();
    wrapper = mount(NPCView, {
      global: {
        plugins: [router, BootstrapVue3],
      },
    });
  });
  test("NPCView displays all npcs", async () => {
    /* currently we have npc GET all npc endpoint
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${config.apiBaseUrl}/courses/${courseId}/worlds/${worldIndex}/npcs`
    );*/
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${config.apiBaseUrl}/courses/${courseId}/worlds/${worldIndex}`
    );

    await flushPromises();
    for (const npc of npcs) {
      expect(wrapper.html()).toContain(npc.index.toString());
    }
  });
});
