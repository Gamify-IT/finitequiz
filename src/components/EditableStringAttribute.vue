<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";

const props = defineProps<{
  value: string | null;
  prefix: string | null;
}>();

const prefix = ref(props.prefix);
const value = ref(props.value);
const editing = ref(false);
const editingValue = ref();

watch(
  () => props.value,
  (newValue) => {
    value.value = newValue;
  },
  { deep: true }
);

watch(
  () => props.prefix,
  (newPrefix) => {
    prefix.value = newPrefix;
  },
  { deep: true }
);

const emit = defineEmits<{
  (e: "submit", value: string): void;
  (e: "cancel"): void;
}>();

function startEdit() {
  editingValue.value = value.value;
  editing.value = true;
}

function saveEdit() {
  emit("submit", editingValue.value);
  editing.value = false;
  editingValue.value = value.value;
}

function cancelEdit() {
  emit("cancel");
  editing.value = false;
  editingValue.value = value.value;
}
</script>

<template>
  <h5 v-if="!editing">
    <span v-if="prefix != null">{{ prefix }}: </span>{{ value }}
    <b-button variant="light" size="small" @click="startEdit">
      <em class="bi bi-pencil-square"></em>
    </b-button>
  </h5>
  <b-col sm="6" v-else>
    <b-form @submit="saveEdit" @cancel="cancelEdit">
      <b-input-group :prepend="prefix">
        <b-form-input v-model="editingValue"></b-form-input>
        <b-button variant="success" type="submit" size="sm" @click="saveEdit">
          <em class="bi bi-journal-check"></em>
        </b-button>
        <b-button variant="danger" size="sm" type="reset" @click="cancelEdit">
          <em class="bi bi-x-lg"></em>
        </b-button>
      </b-input-group>
    </b-form>
  </b-col>
</template>
