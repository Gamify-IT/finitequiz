<template>
  <div>
    <!-- Progress bar to show how much progress the player has made -->
    <div id="coin-container"></div>
    <div class="progress">
      <div
          name="progress-bar"
          class="progress-bar"
          role="progressbar"
          :style="{ width: progressBarWidth + '%' }"
          :aria-valuenow="progressBarValue"
          aria-valuemin="0"
          :aria-valuemax="initialQuestionCount"
      ></div>
    </div>

    <!-- Display current question and answers if available -->
    <div v-if="currentQuestion">
      <div id="question-container">
        <div id="question-wrapper">
          <div id="question">
            <h2 v-if="currentQuestion.text">{{ currentQuestion.text }}</h2>
          </div>
        </div>
        <!-- Images below the question -->
        <div id="images-wrapper" v-if="filteredImages.length > 0">
          <div
              v-for="(imageDTO) in filteredImages"
              :key="imageDTO.imageUUID"
              class="image-box"
              :style="{
    width: filteredImages.length === 1
      ? '80%'
      : filteredImages.length === 2
      ? '40%'
      : ''
  }"
          >
            <img
                v-if="imageDTO.image"
                :src="'data:image/png;base64,' + imageDTO.image"
                alt="Image"
                class="clickable-image"
                @click="openZoom('data:image/png;base64,' + imageDTO.image)"
            />
            <p v-if="imageDTO.description" class="image-description">
              {{ imageDTO.description }}
            </p>
          </div>
        </div>
        <!-- Zoomed Image Modal -->
        <div v-if="zoomImage" class="image-modal" @click.self="closeZoom">
          <div class="zoom-container">
            <!-- Zoomed Image -->
            <img :src="zoomImage" alt="Zoomed"
                 :style="{ width: zoomDimensions.width + 'px', height: zoomDimensions.height + 'px' }"/>

            <!-- Zoom Buttons -->
            <div class="zoom-buttons">
              <button @click="zoomIn" class="zoom-button">+</button>
              <button @click="zoomOut" class="zoom-button">-</button>
            </div>
          </div>
        </div>

        <!-- Answer options below the images -->
        <div id="answers-list">
          <b-button
              v-for="answer in currentAnswers"
              :key="answer"
              class="answer"
              variant="outline-info"
              :name="'buttonId' + answer"
              :disabled="buttonsDisabled"
              @click="chooseAnswer($event, answer)"
              @mouseover="showAnswer = answer"
              @mouseleave="showAnswer = null"
          >
            <!-- Correct Answer Section -->
            <div class="answer-container">
              <template v-if="answer === currentQuestion.rightAnswer[1]">
                <div v-if="currentCorrectAnswerImage" class="image-container">
                  <img
                      :src="'data:image/png;base64,' + currentCorrectAnswerImage"
                      alt="Correct Answer Image"
                      class="answer-image"
                      @click.stop="openZoom('data:image/png;base64,' + currentCorrectAnswerImage)"

                  />
                </div>
                <div v-if="currentQuestion.rightAnswer[1] !== 'no input'" class="text-container">
                  {{ currentQuestion.rightAnswer[1] }}
                </div>
              </template>
              <!-- Wrong Answer Section -->
              <template v-else>
                <div
                    v-if="wrongAnswerImagesURLs.has(currentQuestion.wrongAnswers.find(wa => wa.text === answer)?.uuid ?? '')"
                    class="image-container"
                >
                  <img
                      :src="wrongAnswerImagesURLs.get(currentQuestion.wrongAnswers.find(wa => wa.text === answer)?.uuid ?? '')"
                      alt="Wrong Answer Image"
                      class="answer-image"
                      @click.stop="openZoom(wrongAnswerImagesURLs.get(currentQuestion.wrongAnswers.find(wa => wa.text === answer)?.uuid ?? '') || '')"

                  />
                </div>
                <div v-if="answer && !answer.startsWith('no input')" class="text-container">{{ answer }}</div>
              </template>
            </div>
          </b-button>
        </div>
      </div>
      <!-- Feedback section -->
      <div id="feedback">
        <h1>
          Current score: <span class="outlined-text">{{ correctAnsweredQuestions.length }}</span> /
          <span class="outlined-text">{{ correctAnsweredQuestions.length + wrongAnsweredQuestions.length }}</span>
        </h1>
      </div>
    </div>
    <!-- Show loading spinner when waiting for data -->
    <div v-if="loading" class="loader"></div>
    <!-- End screen with results when the game ends -->
    <div id="end-text-wrapper" v-if="showEndscreen">
      <div v-if="!error" class="end-text">
        <p>
          You answered <span class="green-bold outlined-text">{{ correctAnsweredQuestions.length }}</span> of
          <span class="green-bold outlined-text">{{
              correctAnsweredQuestions.length + wrongAnsweredQuestions.length
            }}</span>
          questions correctly.
        </p>
        <p>
          You've earned <span class="gold-text outlined-text">{{ store.state.score }} scores</span> and
          <span class="gold-text outlined-text">{{ store.state.rewards }} coins!</span>
        </p>
        <p v-if="store.state.score <= 50">Don't give up! You will get there!</p>
        <p v-else-if="store.state.score <= 70">Good job!</p>
        <p v-else>Wow! Congratulations!</p>
        <!-- Display results summary -->
        <div class="results">
          <h2>Results Summary:</h2>
        </div>
        <div class="results-table-container">
          <table class="results-table">
            <thead>
            <tr>
              <th>Question</th>
              <th>Result</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(result, index) in displayedCorrectResults" :key="'correct' + index">
              <td>{{ result.question.text }}</td>
              <td><span class="result-icon yellow">&#10003;</span></td>
            </tr>
            <tr v-for="(result, index) in displayedWrongResults" :key="'wrong' + index">
              <td>{{ result.question.text }}</td>
              <td><span class="result-icon red">&#10008;</span></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="error" class="end-text">
        {{ errorText }}
      </div>
    </div>
  </div>
</template>


/* eslint-disable */
<script setup lang="ts">
import {getQuestions, getVolumeLevel, postGameResult} from "@/ts/minigame-rest-client";
import {GameResultDTO, Question, RoundResultDTO} from "@/ts/models";
import {useToast} from "vue-toastification";
import store from "@/store/index";
import {computed, ref} from "vue";
import correctAnswerSoundSource from "@/assets/music/correct_answer_sound.wav";
import wrongAnswerSoundSource from "@/assets/music/wrong_answer_sound.mp3";
import finishSoundSource from "@/assets/music/finish_sound.wav";
import {getImageByUUID} from "@/ts/minigame-rest-client";
import {watch} from "vue";

let volumeLevel: number | null = 0;
const configurationId = ref("");
const questions = ref<Array<Question>>([]);
const initialQuestionCount = ref(0);
const currentQuestion = ref<Question | null>(null);
const currentAnswers = ref<Array<string>>([]);
const correctAnsweredQuestions = ref<Array<RoundResultDTO>>([]);
const wrongAnsweredQuestions = ref<Array<RoundResultDTO>>([]);
const showEndscreen = ref(false);
const score = ref(0);
const startTime = getCurrentTimeInSeconds();
const buttonsDisabled = ref(false);
const toast = useToast();
const loading = ref(false);
const error = ref(false);
const errorText = ref("");
const rewardsDefault = ref(0);
const showAnswer = ref<string | null>(null);
const maxRowsToShow = 7;
const displayedCorrectResults = computed(() => correctAnsweredQuestions.value.slice(0, maxRowsToShow));
const displayedWrongResults = computed(() => wrongAnsweredQuestions.value.slice(0, maxRowsToShow));
const images = ref<Array<{ imageUUID: string; image: string; description: string }>>([]);
const correctAnswerImage = ref<{ imageUUID: string; image: string } | null>(null);
const showModal = ref(false);
const currentImageToShow = ref<{ imageUUID: string; image: string } | null>(null);
const wrongAnswerImagesURLs = ref<Map<string, string>>(new Map());
const zoomImage = ref<string | null>(null);
const zoomLevel = ref(2.5);
const zoomWidth = ref(450);
const zoomHeight = ref(350);

const zoomDimensions = computed(() => {
  return {
    width: zoomWidth.value * zoomLevel.value,
    height: zoomHeight.value * zoomLevel.value
  };
});

/**
 * Opens the zoom view with the given image URL
 * @param imageUrl The URL of the image to display in zoom view
 */
function openZoom(imageUrl: string) {
  zoomImage.value = imageUrl;
}

/**
 * Closes the zoom view and resets the zoom level
 */
function closeZoom() {
  zoomImage.value = null;
  zoomLevel.value = 1;
}

/**
 * Increases the zoom level by 0.4, up to a maximum of 5
 */
function zoomIn() {
  if (zoomLevel.value < 5) {
    zoomLevel.value += 0.4;
  }
}

/**
 * Decreases the zoom level by 0.4, down to a minimum of 0.5
 */
function zoomOut() {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.4;
  }
}

/**
 * Compute progress bar width
 */
const progressBarWidth = computed(() => {
  return (
      ((initialQuestionCount.value - questions.value.length) /
          initialQuestionCount.value) *
      100
  ).toString();
});

/**
 * Compute progress bar value
 */
const progressBarValue = computed(() => {
  return initialQuestionCount.value - questions.value.length;
});

const currentCorrectAnswerImage = computed(() => {
  if (!currentQuestion.value || !currentQuestion.value.rightAnswer[0]) return null;
  return correctAnswerImage.value?.image;
});

const filteredImages = computed(() => {
  if (!currentQuestion.value) return [];
  return images.value.filter(
      image => image.imageUUID === currentQuestion.value?.uuid
  );
});

/**
 * Represents an image with a unique identifier, the image URL, and a description.
 */
interface Image {
  imageUUID: string;
  image: string;
  description: string;
}

/**
 * Load images for a given UUID
 * @param uuid the UUID of the question to load images for
 */
const loadImages = async (uuid: string) => {
  try {
    const response = await getImageByUUID(uuid);

    if (response.data && response.data.length > 0) {
      const newImages = response.data.filter((newImage: Image) =>
          !images.value.some(image => image.imageUUID === newImage.imageUUID)
      );
      images.value.push(...newImages);
    } else {
      console.log("No images found for UUID:", uuid);
    }
  } catch (error) {
    console.error("Error loading the images", error);
  }
};

/**
 * Loads questions from the server based on the configuration ID from the URL.
 * It fetches the questions, stores them, loads related images, and initiates the next question.
 * In case of an error, it logs the error and sets an error message.
 */
async function loadQuestions() {
  let locationArray = window.location.toString().split("/");
  configurationId.value = locationArray[locationArray.length - 1];

  try {
    const questionsResponse = await getQuestions(configurationId.value);
    questions.value = questionsResponse.data;
    initialQuestionCount.value = questions.value.length;

    for (const question of questions.value) {
      if (question.uuid) {
        await loadImages(question.uuid);
      }
    }

    showEndscreen.value = false;
    error.value = false;
    nextQuestion();
  } catch (error) {
    console.error("Error loading the questions:", error);
    errorText.value = "Error loading the questions";
  }

  getVolumeLevel(configurationId.value).then((response) => {
    volumeLevel = response.data.volumeLevel;
  });
}


/**
 * Create audio with volume level from overworld
 * @param pathToAudioFile
 */
function createAudioWithVolume(pathToAudioFile: string): HTMLAudioElement {
  const audio = new Audio(pathToAudioFile);
  if (volumeLevel == 2 || volumeLevel == 3) {
    volumeLevel = 1;
  } else if (volumeLevel == 1) {
    volumeLevel = 0.5;
  }
  audio.volume = volumeLevel !== null ? volumeLevel : 1;
  return audio;
}

/**
 * Handles the chosen answer
 * @param buttonTarget the button containing the chosen answer
 * @param chosenAnswer text of the chosen answer
 */
function chooseAnswer(buttonTarget: any, chosenAnswer: string) {
  buttonsDisabled.value = true;
  const buttonName = buttonTarget.currentTarget.name;
  let roundResult = new RoundResultDTO(
      currentQuestion.value!.id,
      currentQuestion.value!,
      chosenAnswer
  );

  if (chosenAnswer === currentQuestion.value!.rightAnswer[1]) {
    correctAnsweredQuestions.value.push(roundResult);
    document.getElementsByName(buttonName)[0].style.backgroundColor = "green";
    playSound(correctAnswerSoundSource);
  } else {
    const wrongAnswer = currentQuestion.value!.wrongAnswers.find(
        (wa) => wa.text === chosenAnswer
    );
    if (wrongAnswer) {
      roundResult = new RoundResultDTO(
          currentQuestion.value!.id,
          currentQuestion.value!,
          wrongAnswer.text
      );
      loadWrongAnswerImage(wrongAnswer.uuid);
    }
    wrongAnsweredQuestions.value.push(roundResult);
    document.getElementsByName(buttonName)[0].style.backgroundColor = "red";
    playSound(wrongAnswerSoundSource);
  }
  score.value =
      correctAnsweredQuestions.value.length / initialQuestionCount.value;
  document.getElementsByName("progress-bar")[0].style.width =
      progressBarWidth.value + "%";
  delay(1000)
      .then(() => resetCurrentAnswers())
      .then(() => nextQuestion());
}

/**
 * Delay for a set time
 * @param time amount of time to delay
 */
function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * Reset the current answers
 */
function resetCurrentAnswers() {
  currentAnswers.value = [];
}

function getCurrentTimeInSeconds() {
  return new Date().getTime() / 1000;
}

/**
 * Moves to the next question: Selects a random question, shuffles answers, and loads relevant images.
 * If no questions are left, calculates and sends the game result.
 * Displays the end screen or an error message.
 */
async function nextQuestion() {
  buttonsDisabled.value = false;
  if (questions.value.length >= 1) {
    let number = Math.floor(Math.random() * questions.value.length);
    currentQuestion.value = questions.value[number];
    questions.value.splice(number, 1);

    currentAnswers.value = currentQuestion.value.wrongAnswers.map(answer => answer.text);
    currentAnswers.value.push(currentQuestion.value.rightAnswer[1]);
    currentAnswers.value = currentAnswers.value
        .map((value) => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => value);

    currentQuestion.value.wrongAnswers.forEach(wrongAnswer => {
      loadWrongAnswerImage(wrongAnswer.uuid);
    });
    if (currentQuestion.value.rightAnswer[0]) {
      await loadCorrectAnswerImage(currentQuestion.value.rightAnswer[0]);
    }
  } else {
    const timeSpent = Math.ceil(getCurrentTimeInSeconds() - startTime);
    let result = new GameResultDTO(
        configurationId.value,
        correctAnsweredQuestions.value,
        wrongAnsweredQuestions.value,
        score.value,
        initialQuestionCount.value,
        timeSpent,
        rewardsDefault.value
    );
    resetValues();
    loading.value = true;
    postGameResult(result)
        .then(() => {
          loading.value = false;
          showEndscreen.value = true;
          playSound(finishSoundSource);
        })
        .catch((reason) => {
          loading.value = false;
          showEndscreen.value = true;
          error.value = true;
          errorText.value = reason.response.data.message;
          toast.error(reason.response.data.message);
        });
  }
}


/**
 * Reset fields
 */
function resetValues() {
  questions.value = [];
  currentQuestion.value = null;
  currentAnswers.value = [];
}

/**
 * Play sound with neccesary volume level
 */
async function playSound(pathToAudioFile: string) {
  const sound = await createAudioWithVolume(pathToAudioFile);
  sound.play();
}

/**
 * Fetch and load the correct answer image based on the UUID
 * @param uuid UUID of the correct answer's image
 */
const loadCorrectAnswerImage = async (uuid: string) => {
  try {
    const response = await getImageByUUID(uuid);
    if (response.data && response.data.length > 0) {
      correctAnswerImage.value = response.data[0];
    } else {
      console.log("No correct answer image found for UUID:", uuid);
    }
  } catch (error) {
    console.error("Error loading the correct answer image", error);
  }
};

/**
 * Opens the modal with the clicked image
 * @param imageDTO The image data to show in the modal
 */
function openModal(imageDTO: { imageUUID: string; image: string }) {
  currentImageToShow.value = imageDTO;
  showModal.value = true;
}


/**
 * Closes the modal and clears the displayed image
 */
function closeModal() {
  showModal.value = false;
  currentImageToShow.value = null;
}

/**
 * Load the wrong answer image for a given UUID
 * @param uuid UUID of the wrong answer's image
 */
const loadWrongAnswerImage = async (uuid: string) => {
  try {
    const response = await getImageByUUID(uuid);
    if (response.data && response.data.length > 0) {
      wrongAnswerImagesURLs.value.set(uuid, 'data:image/png;base64,' + response.data[0].image);
    } else {
      console.log("No image found for UUID:", uuid);
    }
  } catch (error) {
    console.error("Error loading the wrong answer image", error);
  }
};
loadQuestions();
</script>

<style scoped>

/* Styling for the end text paragraphs */
.end-text p:first-of-type,
.end-text p:nth-of-type(2) {
  margin-top: 2cm;
}

/* Styling for the answer buttons */
.answer {
  margin-left: 2vw;
  margin-top: 1vw;
  float: left;
  height: 25vh;
  width: 47vw;
  font-size: 2vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: left;
}

/* Container for the content of an answer */
.answer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 10px 0;
  position: relative;
}

.answer-container .image-container {
  position: relative;
  padding-right: 20px;
  display: flex;
  align-items: center;
}

.answer-container .image-container::after {
  content: "";
  position: absolute;
  right: 0;
  top: 15%;
  bottom: 15%;
  width: 2px;
  background-color: #ccc;
  border-radius: 2px;
}


/* Styling for the answer image */
.answer-image {
  max-width: 300px;
  max-height: 300px;
  object-fit: cover;
  border-radius: 5px;
}

/* Styling for the answer text container */
.text-container {
  flex-grow: 1;
  text-align: left;
  font-size: 2vh;
  line-height: 1.5;
}

#images-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1vw;
  justify-content: center;
  margin-top: 2vw;
}

.image-box {
  width: 22%;
  aspect-ratio: 4 / 3;
  max-height: 50vh;
  margin-bottom: 2vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

#images-wrapper > .image-box {
  width: calc(25% - 1vw);
}

@media (max-width: 1200px) {
  #images-wrapper > .image-box {
    width: calc(33% - 1vw);
  }
}

@media (max-width: 800px) {
  #images-wrapper > .image-box {
    width: calc(50% - 1vw);
  }
}

@media (max-width: 500px) {
  #images-wrapper > .image-box {
    width: 100%;
  }
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  margin-bottom: 10px;
}


/* Styling for the feedback section */
#feedback {
  margin-top: 2vw;
  width: 100%;
  text-align: center;
}

/* Styling for the progress bar */
.progress-bar {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  box-shadow: inset 0 0 0 2px #212529 !important;
  border: none !important;
}

/* Styling for the progress container */
.progress {
  border-radius: 0 !important;
  background-color: white !important;
  box-shadow: inset 0 0 0 2px #212529 !important;
  border: none !important;
}

/* Styling for the end screen wrapper */
#end-text-wrapper {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('@/assets/wald.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  background-attachment: fixed;
  opacity: 1.6;
}

/* Styling for the end text */
.end-text {
  text-align: center;
  font-size: 6vh;
  color: white;
}

/* Styling for the loader spinner */
.loader {
  margin: auto;
  border: 16px solid #f3f3f3;
  border-top: 16px solid #3498db;
  border-radius: 20px;
  width: 2vw;
  height: 2vw;
  animation: spin 2s linear infinite;
}

/* Styling for the gold-colored text */
.gold-text {
  color: gold;
  font-weight: bold;
}

/* Styling for the results table container */
.results-table-container {
  margin: 0 auto;
  width: 80%;
  max-height: 50vh;
  overflow-y: auto;
  border: 1px solid white;
}

/* Styling for the results section */
.results {
  margin-top: 20px;
  text-align: center;
  color: white;
}

/* Styling for the results table heading */
.results h2 {
  font-size: 4vh;
}

/* Styling for the results table */
.results-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #006400;
  color: white;
  opacity: 0.75;
}

/* Styling for table headers and cells in the results table */
.results-table th,
.results-table td {
  border: 1px solid white;
  padding: 12px;
  font-size: 1.6vh;
  background-color: #006400;
  color: white;
  text-align: center;
}

/* Styling for result icons (check marks and crosses) in the results table */
.results-table .result-icon.yellow {
  color: yellow;
  font-size: 1.8vh;
  font-weight: bold;
  line-height: 1.8;
}

.results-table .result-icon.red {
  color: red;
  font-size: 2vh;
  font-weight: bold;
  line-height: 1.8;
}

/* Styling for the green-bold text */
.green-bold {
  color: #6a2900;
  font-weight: bold;
}

/* Styling for the answers list container */
#answers-list {
  position: relative;
}


/* Styling for the outlined text (with a text shadow) */
.outlined-text {
  text-shadow: -1px -1px 0 #fff,
  1px -1px 0 #fff,
  -1px 1px 0 #fff,
  1px 1px 0 #fff;
}

/* Styling for the modal content images */
.modal-content img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}


/* Styling for the question container */
#question-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 2vw;
  width: 100%;
}

/* Styling for the question wrapper */
#question-wrapper {
  width: 80%;
  padding: 1vw;
  border: 1px solid black;
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Styling for the question text */
#question {
  text-align: center;
  font-size: 3vh;
}

.image-modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  padding: 20px;
}

.zoom-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-buttons {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}

.zoom-button {
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid #fff;
  border-radius: 5px;
  font-size: 20px;
  padding: 5px;
  cursor: pointer;
  margin: 5px 0;
}

.zoom-button:hover {
  background-color: rgba(255, 255, 255, 1);
}

.image-modal img {
  max-width: 90vw;
  max-height: 90vh;
}

</style>