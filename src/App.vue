<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-dark">
      <a id="FiniteGame">Finite Quiz</a>
      <nav class="ms-auto">
        <b-button class="NavButtons" id="RestartButton" v-on:click="relaodPage">
          Restart
        </b-button>
        <b-button class="NavButtons" id="CloseButton" v-on:click="closeGame">
          Close
        </b-button>
      </nav>
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

function closeGame() {
  window.parent.postMessage("CLOSE ME");
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

.NavButtons {
  border-color: #212529;
  background-color: #212529;
  margin-right: 1vw;
}

#RestartButton:hover {
  border-color: #0c4c87;
  background-color: #0c4c87;
}

#CloseButton:hover {
  border-color: #870c0c;
  background-color: #870c0c;
}
</style>
