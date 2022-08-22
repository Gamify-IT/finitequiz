<script setup lang="ts"></script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-dark">
      <a id="FiniteGame">FINITE GAME</a>
    </nav>
    <div>
      <GameView></GameView>
    </div>
  </div>
</template>
<script>
import GameView from "@/views/GameView";

export default {
  components: { GameView },
};
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
