<script setup lang="ts">
import CourseSidebarMenu from "@/components/CourseSidebarMenu.vue";
</script>

<template>
  {{ course }}
  <div class="app-wrapper">
    <CourseSidebarMenu />
    <!-- route outlet -->
    <!-- component matched by the route will render here -->
    <div class="router-view-wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>
