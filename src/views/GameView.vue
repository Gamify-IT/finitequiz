<template>
  <div>
    <!-- Progress bar to show how much progress the player has made -->
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
        <!-- Question text -->
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
              class="image-box">
            <img v-if="imageDTO.image" :src="'data:image/png;base64,' + imageDTO.image" alt="Image"/>
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
            <!-- Correct answer with image -->
            <div v-if="answer === currentQuestion.rightAnswer[1]" class="answer-with-image">
              <div v-if="currentCorrectAnswerImage?.image">
                <img :src="'data:image/png;base64,' + currentCorrectAnswerImage.image" alt="Correct Answer Image" class="answer-image"/>
              </div>
              <div v-if="currentQuestion.rightAnswer[0] !== 'no input'">
                {{ currentQuestion.rightAnswer[0] }}
              </div>
            </div>
            <div>
              <div
                  v-if="wrongAnswerImagesURLs.has(currentQuestion.wrongAnswers.find(wa => wa.text === answer)?.uuid ?? '')">
                <img
                    :src="wrongAnswerImagesURLs.get(currentQuestion.wrongAnswers.find(wa => wa.text === answer)?.uuid ?? '')"
                    alt="Wrong Answer Image"
                    class="answer-image"
                />
              </div>

              <div v-if="currentQuestion.wrongAnswers.find(wa => wa.text === answer)?.text !== 'no input'">
                {{ answer }}
              </div>
            </div>
          </b-button>
        </div>
        <div v-if="showModal" class="modal" @click.self="closeModal">
          <div class="modal-content">
            <img :src="'data:image/png;base64,' + currentImageToShow?.image" alt="Large View"/>
          </div>
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
          <span class="green-bold outlined-text">{{ correctAnsweredQuestions.length + wrongAnsweredQuestions.length }}</span>
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
              <th>Your Answer</th>
              <th>Result</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(result, index) in displayedCorrectResults" :key="'correct' + index">
              <td>{{ result.question.text }}</td>
              <td>{{ result.answer }}</td>
              <td><span class="result-icon yellow">&#10003;</span></td>
            </tr>
            <tr v-for="(result, index) in displayedWrongResults" :key="'wrong' + index">
              <td>{{ result.question.text }}</td>
              <td>{{ result.answer }}</td>
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
const images = ref<Array<{ imageUUID: string; image: string }>>([]);
const correctAnswerImage = ref<{ imageUUID: string; image: string } | null>(null);
const showModal = ref(false);
const currentImageToShow = ref<{ imageUUID: string; image: string } | null>(null);
const wrongAnswerImagesURLs = ref<Map<string, string>>(new Map());

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

const currentImage = computed(() => {
  if (!currentQuestion.value || !currentQuestion.value.uuid) return null;
  return images.value.find(image => image.imageUUID === currentQuestion.value!.uuid) || null;
});

const currentCorrectAnswerImage = computed(() => {
  if (!currentQuestion.value || !currentQuestion.value.rightAnswer[0]) return null;
  return correctAnswerImage.value;
});
const filteredImages = computed(() => {
  if (!currentQuestion.value) return [];
  return images.value.filter(
      image => image.imageUUID === currentQuestion.value?.uuid
  );
});

interface Image {
  imageUUID: string;
  image: string;
}

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
 * Randomly choose next question
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
      await loadCorrectAnswerImage(currentQuestion.value.rightAnswer[1]);
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

function openModal(imageDTO: { imageUUID: string; image: string }) {
  currentImageToShow.value = imageDTO;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  currentImageToShow.value = null;
}

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
/* Styling for the final text paragraphs */
.end-text p:first-of-type,
.end-text p:nth-of-type(2) {
  margin-top: 2cm;
}

/* Styling for the answer buttons */
.answer {
  margin-left: 2vw;
  margin-top: 1vw;
  float: left;
  height: 10vh;
  width: 47vw;
  font-size: 2vh;
}

/* Container for the question and images */
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

/* Styling for the images wrapper */
#images-wrapper {
  width: 80%;
  padding: 1vw;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1vw;
  margin-top: 2vw;
}

/* Styling for each image */
.image-box {
  width: 20%; /* Images are now smaller */
  margin-bottom: 1vw;
  text-align: center;
}

/* Styling for the feedback */
#feedback {
  margin-top: 2vw;
  width: 100%;
  text-align: center;
}

/* Styling for the answer buttons */
.answer {
  margin-left: 2vw;
  margin-top: 1vw;
  float: left;
  height: 10vh;
  width: 47vw;
  font-size: 2vh;
}

.answer-with-image {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.answer-image {
  width: 90px;
  height: 90px;
  margin-right: 10px;
}


/* Styling for the progress bar */
.progress-bar {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  -webkit-box-shadow: inset 0 0 0 2px #212529 !important;
  -moz-box-shadow: inset 0 0 0 2px #212529 !important;
  box-shadow: inset 0 0 0 2px #212529 !important;
  border: none !important;
}

/* Styling for the entire progress bar container */
.progress {
  border-radius: 0 !important;
  background-color: white !important;
  -webkit-box-shadow: inset 0 0 0 2px #212529 !important;
  -moz-box-shadow: inset 0 0 0 2px #212529 !important;
  box-shadow: inset 0 0 0 2px #212529 !important;
  border: none !important;
}

/* Styling for the end screen container */
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

/* Styling for golden text */
.gold-text {
  color: gold;
  font-weight: bold;
}

/* Container for the results table */
.results-table-container {
  margin: 0 auto;
  width: 80%;
  max-height: 50vh;
  overflow-y: auto;
  border: 1px solid white;
}

/* Styling for the results summary area */
.results {
  margin-top: 20px;
  text-align: center;
  color: white;
}

/* Styling for the results table header */
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

/* Styling for table headers and cells */
.results-table th,
.results-table td {
  border: 1px solid white;
  padding: 12px;
  font-size: 1.6vh;
  background-color: #006400;
  color: white;
  text-align: center;
}

.results-table-container {
  margin: 0 auto;
  width: 80%;
  max-height: 50vh;
  overflow-y: auto;
  border: 1px solid white;
}

/* Icon styles for results (yellow for correct, red for incorrect) */
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

/* Green bold text for score display */
.green-bold {
  color: #6a2900;
  font-weight: bold;
}

/* Styling for the answer list container */
#answers-list {
  position: relative;
}

/* Info display for each answer (shown on hover) */
.answer-info {
  position: absolute;
  top: 0;
  left: 0;
  display: none;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
}

/* Show info when hovering over an answer */
.answer:hover .answer-info {
  display: block;
}

/* Text with an outline effect */
.outlined-text {
  text-shadow: -1px -1px 0 #fff,
  1px -1px 0 #fff,
  -1px 1px 0 #fff,
  1px 1px 0 #fff;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content img {
  max-width: 80%;
  max-height: 80%;
  margin: auto;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
}
</style>