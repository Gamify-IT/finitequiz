<template>
  <div>
    <nav
      class="navbar navbar-expand-lg navbar-light bg-dark"
      aria-label="Navigation Bar"
    >
      <a id="finite-game">Finite Quiz</a>
      <nav class="ms-auto" aria-label="Navigation Bar">
        <b-button
          class="nav-buttons"
          id="restart-button"
          v-on:click="reloadPage"
        >
          Restart
        </b-button>
        <b-button class="nav-buttons" id="close-button" v-on:click="closeGame">
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
import { onMounted, onUnmounted } from "vue";
const backgroundMusic = new Audio("@/assets/music/background_music.mp3");
const clickSound = new Audio("@/assets/music/click_sound.mp3");

/**
 * Reload the page
 */
function reloadPage() {
  playClickSound();
  window.location.reload();
}

/**
 * Close the Minigame iframe
 */
function closeGame() {
  playClickSound(); 
  window.parent.postMessage("CLOSE ME");
}

function playClickSound(){
  clickSound.play();
}
onMounted(() => {
  backgroundMusic.play();
  backgroundMusic.loop = true;
});

onUnmounted(() => {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
});
</script>
<style scoped>
.navbar {
  padding-left: 1vw;
  height: 7vh;
}

#finite-game {
  color: white;
}

.nav-buttons {
  border-color: #212529;
  background-color: #212529;
  margin-right: 1vw;
}

#restart-button:hover {
  border-color: #0c4c87;
  background-color: #0c4c87;
}

#close-button:hover {
  border-color: #870c0c;
  background-color: #870c0c;
}
</style>
