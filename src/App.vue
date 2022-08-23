<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-dark">
      <a id="FiniteGame">FINITE GAME</a>
      <b-button id="ResetGame" v-on:click="relaodPage">Restart</b-button>
    </nav>
    <div>
      <GameView></GameView>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameView from "@/views/GameView";

function relaodPage() {
  window.location.reload();
}
</script>
<style scoped>
.navbar {
  padding-left: 1vw;
  height: 7vh;
}

#FiniteGame {
  color: white;
}
</style>
