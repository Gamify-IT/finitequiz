<script setup lang="ts">
import { INPC, IWorld } from "@/ts/models";
import { putNPC } from "@/ts/npc-rest-client";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import NPCEditModal from "@/components/EditNPCModal.vue";
import { getArea } from "@/ts/area-rest-client";

const toast = useToast();
const route = useRoute();
const courseId = ref(route.params.courseId);
const worldIndex = ref(route.params.worldIndex);
const dungeonIndex = ref(route.params.dungeonIndex);

const editedNPC = ref();
const showEditModal = ref(false);

watch(
  () => [
    route.params.courseId,
    route.params.worldIndex,
    route.params.dungeonIndex,
  ],
  (newVal) => {
    courseId.value = newVal[0];
    worldIndex.value = newVal[1];
    dungeonIndex.value = newVal[2];
    loadNPCs(courseId.value, worldIndex.value, dungeonIndex.value);
  },
  { deep: true }
);

const npcs = ref(Array<INPC>());

async function loadNPCs(courseId: any, worldIndex: any, dungeonIndex: any) {
  console.log("load npcs");
  if (
    isNaN(courseId) ||
    isNaN(worldIndex) ||
    (dungeonIndex != undefined && isNaN(dungeonIndex))
  ) {
    console.log("one of the ids is NaN");
    return;
  }
  getArea(courseId, worldIndex, dungeonIndex)
    .then((response) => {
      const result: IWorld = response.data;
      npcs.value = result.npcs.sort((npc1, npc2) => npc1.index - npc2.index);
      console.log(npcs.value);
    })
    .catch((error) => {
      console.log(error);
    });
}

loadNPCs(courseId.value, worldIndex.value, dungeonIndex.value);

function editNPC(npc: INPC) {
  editedNPC.value = npc;
  console.log("Want to edit NPC " + npc.id);
  showEditModal.value = true;
}

function updateNPC(npc: INPC) {
  console.log("Pressed submit button in npc configuration modal");
  putNPC(courseId.value, worldIndex.value, dungeonIndex.value, npc.index, npc)
    .then(() => {
      toast.success(`NPC with index ${npc.index} was updated!`);
    })
    .catch(() => {
      toast.error(`NPC with index ${npc.index} could not be updated!`);
    });
}

function closedEditModal() {
  console.log("Parent got info that modal was closed");
  showEditModal.value = false;
}
</script>

<template>
  <div class="container mt-4">
    <h1 v-if="dungeonIndex === undefined">NPCs from World {{ worldIndex }}</h1>
    <h1 v-else>
      NPCs from World World {{ worldIndex }}, Dungeon {{ dungeonIndex }}
    </h1>
    <b-card v-for="npc in npcs" :key="npc.id" class="mt-1">
      <b-row>
        <b-col>{{ npc.index }}</b-col>
        <b-col>
          <b-button variant="info" size="small" @click="editNPC(npc)">
            <em class="bi bi-pencil-square"></em>
            Edit
          </b-button>
        </b-col>
      </b-row>
    </b-card>
  </div>
  <NPCEditModal
    :showModal="showEditModal"
    :npc="editedNPC"
    @updateNPC="updateNPC"
    @closedModal="closedEditModal"
  />
</template>
