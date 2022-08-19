import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import EditChickenshockConfigurationModal from "@/components/EditChickenshockConfigurationModal.vue";
import { IChickenshockConfiguration, ITask, Minigame } from "@/ts/models";
import BootstrapVue3, { BButton, BModal } from "bootstrap-vue-3";
import router from "@/router";
import mockAxios from "jest-mock-axios";

jest.mock("axios");

describe("EditChickenshockConfigurationModal.vue", () => {
  let wrapper: VueWrapper;
  let minigame: ITask;
  let configuration: IChickenshockConfiguration;
  const showModal = true;
  const addedQuestion = "addedQuestion";
  const addedAnswer = "addedAnswer";
  const addedWrongAnswer = "aWrongAnswer";

  beforeEach(async () => {
    jest.clearAllMocks();
    minigame = {
      id: "Id",
      index: 1,
      game: Minigame.CHICKENSHOCK,
      configurationId: "configuration",
    };
    configuration = {
      id: "configuration",
      questions: [
        {
          text: "question",
          rightAnswer: "answer",
          wrongAnswers: ["wrongAnswer"],
        },
      ],
    };
    const configurationResponse = {
      data: configuration,
    };
    const div = document.createElement("div");
    div.id = "root";
    document.body.appendChild(div);
    mockAxios.get.mockResolvedValueOnce(configurationResponse);
    router.push(`/courses/1/worlds/1`);
    await router.isReady();
    wrapper = mount(EditChickenshockConfigurationModal, {
      attachTo: document.body,
      props: {
        minigame: minigame,
        showModal: showModal,
      },
      global: {
        plugins: [router, BootstrapVue3],
      },
    });
  });

  test("Modal exists", async () => {
    const modal = wrapper.findComponent(BModal);
    expect(modal.exists()).toBe(true);
  });

  test("Add Question", async () => {
    const chickenshockModal = wrapper.findComponent(BModal);
    expect(chickenshockModal.exists()).toBe(true);
    const buttonAddQuestion = wrapper.findComponent(BButton);
    expect(buttonAddQuestion.exists()).toBe(true);
    await buttonAddQuestion.trigger("click");
    await flushPromises();
    const questionModal = wrapper.findComponent(BModal);
    expect(questionModal.exists()).toBe(true);
    const questionInput = wrapper.findComponent("#question-input");
    expect(questionInput.exists()).toBe(true);
    await questionInput.setValue(addedQuestion);
    const answerInput = wrapper.findComponent("#correct-answer");
    expect(answerInput.exists()).toBe(true);
    await answerInput.setValue(addedAnswer);
    const wrongAnswerInput = wrapper.findComponent("#wrong-answer");
    expect(wrongAnswerInput.exists()).toBe(true);
    await wrongAnswerInput.setValue(addedWrongAnswer);
    const buttonAddWrongAnswer = wrapper.findComponent("#button-wrong-answer");
    expect(buttonAddWrongAnswer.exists()).toBe(true);
  });
});
