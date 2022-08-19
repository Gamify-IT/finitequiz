import { flushPromises, mount } from "@vue/test-utils";
import AreaBox from "@/components/AreaBox.vue";
import { Dungeon, IArea, Minigame, Task } from "@/ts/models";
import BootstrapVue3, { BButton, BFormInput } from "bootstrap-vue-3";
import WrapperLike from "@vue/test-utils/dist/interfaces/wrapperLike";
import config from "@/config";
import mockAxios from "jest-mock-axios";

jest.mock("axios");

describe("AreaBox.vue", () => {
  let wrapper: WrapperLike;
  const courseId = 1;
  const worldIndex = 1;
  const dungeonIndex = 1;
  let dungeon: IArea;

  beforeEach(() => {
    jest.clearAllMocks();
    const tasks = [
      new Task("1", 1, Minigame.BUGFINDER, "random uuid"),
      new Task("2", 2, Minigame.CHICKENSHOCK, "random uuid 2"),
    ];
    dungeon = new Dungeon(
      "random uuid",
      dungeonIndex,
      "Dungeon 1",
      "Kapitel 1: UML",
      true,
      tasks,
      []
    );
    wrapper = mount(AreaBox, {
      props: {
        area: dungeon,
        courseId: courseId,
        worldIndex: worldIndex,
        dungeonIndex: dungeonIndex,
      },
      global: {
        plugins: [BootstrapVue3],
      },
    });
  });
  test("AreaBox shows in a coloumn lecturer name and given name", () => {
    const areaNameColumn = wrapper.find("#area-name-column");
    expect(areaNameColumn.exists()).toBe(true);
    expect(areaNameColumn.html()).toContain(dungeon.topicName);
  });
  test("Topic-Name is editable on button click and saveable", async () => {
    const initialDungeonTopicName = dungeon.topicName;

    const updatedDungeonTopicName = "New Chapter XY";

    let areaNameColumn = wrapper.find("#area-name-column");
    let topicNameInput = areaNameColumn.findComponent(BFormInput);
    expect(areaNameColumn.exists()).toBe(true);
    expect(areaNameColumn.html()).toContain(initialDungeonTopicName);

    expect(topicNameInput.exists()).toBe(false);

    const editButton = areaNameColumn.findComponent(BButton);
    editButton.trigger("click");

    // wait that component re-renders
    await flushPromises();

    areaNameColumn = wrapper.find("#area-name-column");
    topicNameInput = areaNameColumn.findComponent(BFormInput);
    expect(topicNameInput.exists()).toBe(true);
    topicNameInput.setValue(updatedDungeonTopicName);

    // click save button
    const submitButton = areaNameColumn.find(".btn-success");
    expect(submitButton.exists()).toBe(true);
    submitButton.trigger("click");

    // wait that component re-renders
    await flushPromises();

    areaNameColumn = wrapper.find("#area-name-column");
    topicNameInput = areaNameColumn.findComponent(BFormInput);
    expect(topicNameInput.exists()).toBe(false);
    expect(areaNameColumn.html()).toContain(updatedDungeonTopicName);

    expect(mockAxios.put).toHaveBeenCalledWith(
      `${config.apiBaseUrl}/courses/${courseId}/worlds/${worldIndex}/dungeons/${dungeonIndex}`,
      dungeon
    );
  });
  test("Topic-Name is editable on button click and cancelable", async () => {
    const initialDungeonTopicName = dungeon.topicName;

    const updatedDungeonTopicName = "New Chapter XY";

    let areaNameColumn = wrapper.find("#area-name-column");
    let topicNameInput = areaNameColumn.findComponent(BFormInput);
    expect(areaNameColumn.exists()).toBe(true);
    expect(areaNameColumn.html()).toContain(initialDungeonTopicName);

    expect(topicNameInput.exists()).toBe(false);

    const editButton = areaNameColumn.findComponent(BButton);
    editButton.trigger("click");

    // wait that component re-renders
    await flushPromises();

    areaNameColumn = wrapper.find("#area-name-column");
    topicNameInput = areaNameColumn.findComponent(BFormInput);
    expect(topicNameInput.exists()).toBe(true);
    topicNameInput.setValue(updatedDungeonTopicName);

    // click save button
    const cancelButton = areaNameColumn.find(".btn-danger");
    expect(cancelButton.exists()).toBe(true);
    cancelButton.trigger("click");

    // wait that component re-renders
    await flushPromises();

    areaNameColumn = wrapper.find("#area-name-column");
    topicNameInput = areaNameColumn.findComponent(BFormInput);
    expect(topicNameInput.exists()).toBe(false);
    expect(areaNameColumn.html()).toContain(initialDungeonTopicName);

    expect(mockAxios.put).toHaveBeenCalledTimes(0);
  });
});
