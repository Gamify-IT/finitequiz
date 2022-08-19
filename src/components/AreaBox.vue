<script setup lang="ts">
import { defineProps, ref, watch } from "vue";
import { updateArea } from "@/ts/area-rest-client";
import { IArea } from "@/ts/models";
import { useToast } from "vue-toastification";
import EditableStringAttribute from "@/components/EditableStringAttribute.vue";

const props = defineProps<{
  area: IArea;
  courseId: number;
  worldIndex: number;
  dungeonIndex: number;
}>();

const toast = useToast();

const area = ref(props.area);

watch(
  () => props.area,
  (newArea) => {
    area.value = newArea;
  },
  { deep: true }
);

function saveTopicName(topicName: string) {
  area.value.topicName = topicName;
  updateArea(props.courseId, props.worldIndex, props.dungeonIndex, area.value)
    .then((response) => {
      area.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
  toast.success(
    `Topic name of course ${area.value.staticName} was updated to ${area.value.topicName}!`
  );
}

function cancelEditTopicName() {
  toast.warning(
    `Topic name of course ${area.value.staticName} was not updated!`
  );
}

function toggledAreaSwitch(toggledArea: IArea) {
  console.log("Toggled switch of " + toggledArea.staticName);
  console.log(toggledArea.active);
  updateArea(props.courseId, props.worldIndex, props.dungeonIndex, toggledArea)
    .then((response) => {
      const result: IArea = response.data;
      if (result.active) {
        toast.success(`Area ${toggledArea.staticName} was activated!`);
      } else {
        toast.error(`Area ${toggledArea.staticName} was deactivated!`);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
</script>

<template>
  <b-td>
    <h5>{{ area.staticName }}</h5>
  </b-td>
  <b-td id="area-name-column">
    <EditableStringAttribute
      :prefix="null"
      :value="area.topicName"
      @submit="saveTopicName"
      @cancel="cancelEditTopicName"
    />
  </b-td>
  <b-td>
    <b-form-checkbox
      v-model="area.active"
      @change="toggledAreaSwitch(area)"
      name="check-button"
      switch
    >
    </b-form-checkbox>
  </b-td>
</template>
