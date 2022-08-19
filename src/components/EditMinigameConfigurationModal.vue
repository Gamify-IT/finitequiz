<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";
import { ITask } from "@/ts/models";

const props = defineProps<{
  minigame: ITask;
  showModal: boolean;
}>();

const minigame = ref();
const form = ref();
const showModal = ref(props.showModal);

watch(
  () => props.minigame,
  (newMinigame) => {
    minigame.value = newMinigame;
  },
  { deep: true }
);

watch(
  () => props.showModal,
  (newBoolean) => {
    showModal.value = newBoolean;
  },
  { deep: true }
);

const emit = defineEmits<{
  (e: "updateMinigameConfiguration", minigame: ITask): void;
  (e: "closedModal"): void;
}>();

function checkFormValidity(): boolean {
  return form.value.checkValidity();
}

function resetModal() {
  console.log(minigame.value.game);
  console.log("Reset Modal");
}

function handleOk() {
  console.log("Submit Modal");
  handleSubmit();
}

function hiddenModal() {
  console.log("Modal hidden");
  emit("closedModal");
}

function handleSubmit() {
  // Exit when the form isn't valid
  if (!checkFormValidity()) {
    return;
  }
  emit("updateMinigameConfiguration", minigame.value);
}
</script>
<template>
  <b-modal
    title="Edit configuration"
    v-model="showModal"
    @show="resetModal"
    @hidden="hiddenModal"
    @ok="handleOk"
  >
    <form
      ref="form"
      @submit.stop.prevent="handleSubmit"
      v-if="minigame !== undefined"
    >
      <b-form-group label="Name" label-for="name-input">
        <b-form-input id="name-input" v-model="minigame.lectureName" required />
      </b-form-group>
    </form>
  </b-modal>
</template>
