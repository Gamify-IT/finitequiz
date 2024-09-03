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
          v-on:click="handleReloadPage"
        >
          Restart
        </b-button>
        <b-button class="nav-buttons" id="close-button" v-on:click="handleCloseGame">
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
import { onMounted, onUnmounted, watch } from "vue";
import backgroundMusicSource from "@/assets/music/background_music.mp3";
import clickSoundSource from "@/assets/music/click_sound.mp3";
import {getVolumeLevel} from "@/ts/minigame-rest-client";
import { computed, ref } from "vue";

let volumeLevel : number|null = 0;
const backgroundMusic = new Audio(backgroundMusicSource);
const clickSound = new Audio(clickSoundSource);
const configurationId = ref("");


/**
 * Reload the page
 */
function reloadPage() {
  window.location.reload();
}

/**
 * Close the Minigame iframe
 */
function closeGame() {
  window.parent.postMessage("CLOSE ME");
}

/**
 * Play click sound
 */
function playClickSound(){
  clickSound.play();
}

/**
 * Play click sound and then close game
 */
async function handleCloseGame() {
  await playClickSound();
    setTimeout(() => {
      closeGame();
    }, 500);
}

/**
 * Play click sound and then reload game
 */
async function handleReloadPage() {
  await playClickSound();
    setTimeout(() => {
      reloadPage();
    }, 500);
}

/**
 * Change volume level of audio
 */
function adjustVolume(volume: number | null) {
  if (volume === 2 || volume === 3) {
    volume = 1;
  } else if (volume === 1) {
    volume = 0.5;
  } else {
    volume = 0;
  }

  backgroundMusic.volume = volume;
  clickSound.volume = volume;
}

/**
 * Get volume level 
 */
async function fetchAndUpdateVolume() {
  try {
    const response = await getVolumeLevel(configurationId.value);
    volumeLevel = response.data.volumeLevel;
    console.log("Volume level in finiteQuiz: " + volumeLevel);

    adjustVolume(volumeLevel);

    backgroundMusic.play();
    backgroundMusic.loop = true;
  } catch (error) {
    console.error('Error fetching volume level:', error);
  }
}

onMounted(async () => {
  let locationArray = window.location.toString().split("/");
  configurationId.value = locationArray[locationArray.length - 1];

  await fetchAndUpdateVolume();
});

watch(() => configurationId.value, async (value) => {
  if (value) {
    await fetchAndUpdateVolume();
  } else {
    console.error('Invalid configuration parameter');
  }
}, { immediate: true });

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
