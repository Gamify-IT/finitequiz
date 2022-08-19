<script setup lang="ts">
import { IDungeon } from "@/ts/models";
import { getWorld } from "@/ts/world-rest-client";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import AreaBox from "../components/AreaBox.vue";
import { useToast } from "vue-toastification";

useToast();
const route = useRoute();
const courseId = ref(parseInt(route.params.courseId as string));
const worldIndex = ref(parseInt(route.params.worldIndex as string));
const world = ref();

loadSelectedWorld(courseId.value, worldIndex.value);

function loadSelectedWorld(
  selectedCourseId: number,
  selectedWorldIndex: number
) {
  getWorld(selectedCourseId, selectedWorldIndex)
    .then((response) => {
      world.value = response.data;
      world.value.dungeons = world.value.dungeons.sort(
        (dungeon1: IDungeon, dungeon2: IDungeon) =>
          dungeon1.index > dungeon2.index
      );
      console.log("Loaded selected world " + selectedWorldIndex);
    })
    .catch((error) => {
      console.log(error);
    });
}

watch(
  () => [route.params.courseId, route.params.worldIndex],
  (newVal) => {
    courseId.value = parseInt(newVal[0] as string);
    worldIndex.value = parseInt(newVal[1] as string);
    loadSelectedWorld(courseId.value, worldIndex.value);
  },
  { deep: true }
);
</script>

<template>
  <div v-if="world !== undefined" class="container mt-5">
    <h2>Configure World {{ world.index }}</h2>
    <h4>{{ world.staticName }}</h4>

    <div style="margin-top: 30px">
      <b-table-simple>
        <b-thead head-variant="dark">
          <b-tr>
            <b-th>Static-Name</b-th>
            <b-th>Topic-Name</b-th>
            <b-th>Active</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr>
            <AreaBox
              :area="world"
              :courseId="courseId"
              :worldIndex="world.index"
              :dungeonIndex="0"
            />
          </b-tr>
          <b-tr v-for="dungeon in world.dungeons" :key="dungeon.id">
            <AreaBox
              :area="dungeon"
              :courseId="courseId"
              :worldIndex="world.index"
              :dungeonIndex="dungeon.index"
            />
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </div>
  </div>
  <div v-else class="container mt-5 error">
    <div
      class="alert alert-danger alert-dismissible d-flex align-items-center fade show"
    >
      <em class="bi-exclamation-octagon-fill"></em>
      <strong class="mx-2">Error!</strong>
      World in course {{ courseId }} with index {{ worldIndex }} not found;
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  </div>
</template>
