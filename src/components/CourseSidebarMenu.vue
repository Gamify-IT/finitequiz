<script setup lang="ts">
import { ref, watch } from "vue";
import "vue-sidebar-menu/dist/vue-sidebar-menu.css";
import { ICourse, IDungeon, IWorld } from "@/ts/models";

import { computed } from "vue";
import { useRouter } from "vue-router";
import { getCourse } from "@/ts/course-rest-client";

const router = useRouter();
let course: ICourse;
const menu = ref([]);

const sidebarActive = [
  "course",
  "worlds",
  "world-minigames",
  "dungeon-minigames",
  "world-npcs",
  "dungeon-npcs",
];

watch(
  () => [router.currentRoute.value.fullPath],
  () => {
    getCourseIdFromRouter().then((id) => {
      if (course == null || course.id != id) {
        update();
      }
    });
  },
  { deep: true }
);

function loadCourse(id: number) {
  getCourse(id)
    .then((response) => {
      const result: ICourse = response.data;
      course = result;
      console.log(course);
      loadMenu();
    })
    .catch((error) => {
      console.log(error);
    });
}

function loadMenu() {
  if (course == null) {
    return;
  }
  menu.value = [
    {
      header: "Main Navigation",
      hiddenOnCollapse: false,
    },
  ];
  menu.value.push({
    href: "/",
    title: "Back to course overview",
    icon: "bi-card-heading",
  });
  menu.value.push({
    href: "/courses/" + course.id,
    title: "Course: " + course.courseName,
    icon: "bi-book-half",
  });
  const worlds: IWorld[] = course.worlds.sort(
    (world1, world2) => world1.index - world2.index
  );

  worlds.forEach((world: IWorld) => {
    const dungeons: IDungeon[] = world.dungeons.sort(
      (dungeon1, dungeon2) => dungeon1.index - dungeon2.index
    );
    const dungeonChild = dungeons.map((dungeon) => {
      return {
        title: "Dungeon " + dungeon.index,
        icon: "bi-tablet-landscape",
        child: [
          {
            href:
              "/courses/" +
              course.id +
              "/worlds/" +
              world.index +
              "/dungeons/" +
              dungeon.index +
              "/minigames",
            title: "Minigames",
            icon: "bi-puzzle-fill",
          },
          {
            href:
              "/courses/" +
              course.id +
              "/worlds/" +
              world.index +
              "/dungeons/" +
              dungeon.index +
              "/npcs",
            title: "NPC",
            icon: "bi-person-fill",
          },
        ],
      };
    });

    const taskChild = [
      {
        href: "/courses/" + course.id + "/worlds/" + world.index + "/minigames",
        title: "Minigames",
        icon: "bi-puzzle-fill",
      },
      {
        href: "/courses/" + course.id + "/worlds/" + world.index + "/npcs",
        title: "NPC",
        icon: "bi-person-fill",
      },
    ];

    menu.value.push({
      href: "/courses/" + course.id + "/worlds/" + world.index,
      title: world.staticName,
      icon: "bi-map-fill",
      child: [...taskChild, ...dungeonChild],
    });
  });

  console.log("LOADED MENU");
  console.log(menu.value);
}

function update() {
  console.log("trigger sidebar update");
  showSideBar().then((show) => {
    if (show) {
      getCourseIdFromRouter().then((courseId) => {
        loadCourse(courseId);
      });
    }
  });
}

async function showSideBar(): Promise<boolean> {
  await router.isReady();
  const route = router.currentRoute.value.name;
  if (route) {
    return sidebarActive.includes(route.toString());
  }
  return false;
}

const showSideBarComputed = computed(() => {
  const route = router.currentRoute.value.name;
  if (route) {
    return sidebarActive.includes(route.toString());
  }
  return false;
});

async function getCourseIdFromRouter(): Promise<number> {
  console.log(showSideBar);
  await router.isReady();
  const args = router.currentRoute.value.fullPath.split("/");
  if (args.length > 2) {
    if (args[1].toLowerCase() == "courses") {
      return parseInt(args[2] as string);
    }
  }
  return 0;
}

update();
</script>

<template>
  <sidebar-menu
    :menu="menu"
    :relative="true"
    :showOneChild="true"
    v-if="showSideBarComputed"
  >
  </sidebar-menu>
</template>

<style>
.app-wrapper {
  height: 100vh;
  display: flex;
}

.v-sidebar-menu {
  height: 100%;
}

.router-view-wrapper {
  width: 100%;
  overflow: scroll;
}
.v-sidebar-menu .vsm--dropdown {
  padding-left: 30px;
}
</style>
