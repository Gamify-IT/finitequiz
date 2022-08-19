import WorldView from "@/views/WorldView.vue";
import CoursesView from "@/views/CoursesView.vue";
import CourseView from "@/views/CourseView.vue";
import MinigameTasksView from "@/views/MinigameTasksView.vue";
import NPCView from "@/views/NPCsView.vue";

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "courses",
    component: CoursesView,
  },
  {
    path: "/courses/:id",
    name: "course",
    component: CourseView,
  },
  {
    path: "/courses/:courseId/worlds/:worldIndex",
    name: "worlds",
    component: WorldView,
  },
  {
    path: "/courses/:courseId/worlds/:worldIndex/minigames",
    name: "world-minigames",
    component: MinigameTasksView,
  },
  {
    path: "/courses/:courseId/worlds/:worldIndex/dungeons/:dungeonIndex/minigames",
    name: "dungeon-minigames",
    component: MinigameTasksView,
  },
  {
    path: "/courses/:courseId/worlds/:worldIndex/npcs",
    name: "world-npcs",
    component: NPCView,
  },
  {
    path: "/courses/:courseId/worlds/:worldIndex/dungeons/:dungeonIndex/npcs",
    name: "dungeon-npcs",
    component: NPCView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
