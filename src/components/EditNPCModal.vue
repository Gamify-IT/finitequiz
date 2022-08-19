<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";
import { INPC } from "@/ts/models";

const props = defineProps<{
  npc: INPC;
  showModal: boolean;
}>();

const npc = ref();
const form = ref();
const showModal = ref(props.showModal);

const text = ref(Array<string>());

function addEntry() {
  text.value.push("");
}

function removeEntry(index: number) {
  text.value.splice(index, 1);
}

watch(
  () => props.npc,
  (newNPC) => {
    npc.value = newNPC;
    // We just COPY the content of the list to make sure, the model does not get updated when hitting cancel
    text.value = [...npc.value.text];
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
  (e: "updateNPC", npc: INPC): void;
  (e: "closedModal"): void;
}>();

function checkFormValidity(): boolean {
  return form.value.checkValidity();
}

function resetModal() {
  text.value = [...npc.value.text];
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
  npc.value.text = text.value;
  emit("updateNPC", npc.value);
}
</script>

<template>
  <b-modal
    title="Edit NPC configuration"
    v-model="showModal"
    @show="resetModal"
    @hidden="hiddenModal"
    @ok="handleOk"
    v-if="npc !== undefined"
  >
    <form ref="form" @submit.stop.prevent="handleSubmit">
      <b-input-group
        v-for="index in text.length"
        :key="index"
        label="Text"
        label-for="text-input"
        :prepend="`Input-${index}`"
        class="mt-3"
      >
        <b-form-input id="text-input" v-model="text[index - 1]" />
        <b-button size="sm" variant="danger" @click="removeEntry(index - 1)">
          <em class="bi bi-trash"></em>
        </b-button>
      </b-input-group>
      <b-button @click="addEntry" variant="success" class="mt-3"
        >Add Input</b-button
      >
    </form>
  </b-modal>
</template>
