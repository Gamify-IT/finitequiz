import { shallowMount } from "@vue/test-utils";
import EditMinigameConfigurationModal from "@/components/EditMinigameConfigurationModal.vue";
import { Minigame } from "@/ts/models";
import BootstrapVue3, { BModal } from "bootstrap-vue-3";

describe("EditMinigameConfigurationModal.vue", () => {
  const minigame = Minigame.BUGFINDER;
  const showModal = true;
  const wrapper = shallowMount(EditMinigameConfigurationModal, {
    props: {
      minigame: minigame,
      showModal: showModal,
    },
    global: {
      plugins: [BootstrapVue3],
    },
  });
  test("Modal exists", async () => {
    const modal = wrapper.findComponent(BModal);
    expect(modal.exists()).toBe(true);
  });
});
