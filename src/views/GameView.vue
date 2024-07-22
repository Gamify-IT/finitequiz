<template>
  <div>
    <!-- Progress bar -->
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

    <div v-if="currentQuestion">
      <div id="question-wrapper">
        <div id="question">
          <h2>{{ currentQuestion.text }}</h2>
        </div>
      </div>
      <div id="feedback">
        <h1>
          Current score: <span class="outlined-text">{{ correctAnsweredQuestions.length }}</span> /
          <span class="outlined-text">{{ correctAnsweredQuestions.length + wrongAnsweredQuestions.length }}</span>
        </h1>
      </div>
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
          {{ answer }}
        </b-button>
      </div>
    </div>

    <div v-if="loading" class="loader"></div>

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

<script setup lang="ts">
import { getQuestions, postGameResult } from "@/ts/minigame-rest-client";
import { GameResultDTO, Question, RoundResultDTO } from "@/ts/models";
import { useToast } from "vue-toastification";
import store from "@/store/index";
import { computed, ref } from "vue";


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
const progressBarWidth = computed(() => {
  return (
      ((initialQuestionCount.value - questions.value.length) /
          initialQuestionCount.value) *
      100
  ).toString();
});

const progressBarValue = computed(() => {
  return initialQuestionCount.value - questions.value.length;
});


/**
 * Initialize all fields
 */
async function loadQuestions() {
  let locationArray = window.location.toString().split("/");
  configurationId.value = locationArray[locationArray.length - 1];
  getQuestions(configurationId.value).then((response) => {
    questions.value = response.data;
    initialQuestionCount.value = questions.value.length;
    showEndscreen.value = false;
    error.value = false;
    nextQuestion();
  });
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
  if (chosenAnswer === currentQuestion.value!.rightAnswer) {
    correctAnsweredQuestions.value.push(roundResult);
    document.getElementsByName(buttonName)[0].style.backgroundColor = "green";
  } else {
    wrongAnsweredQuestions.value.push(roundResult);
    document.getElementsByName(buttonName)[0].style.backgroundColor = "red";
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
function nextQuestion() {
  buttonsDisabled.value = false;
  if (questions.value.length >= 1) {
    let number = Math.floor(Math.random() * questions.value.length);
    currentQuestion.value = questions.value[number];
    questions.value.splice(number, 1);
    currentAnswers.value = currentQuestion.value.wrongAnswers;
    currentAnswers.value.push(currentQuestion.value.rightAnswer);
    currentAnswers.value = currentAnswers.value
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
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
        })
        .catch((reason) => {
          loading.value = false;
          showEndscreen.value = true;
          error.value = true;
          errorText.value = reason.message;
          toast.error(reason.message);
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

function playSound(pathToAudioFile: string, duration: number){
  const sound = new Audio(pathToAudioFile);
  sound.play();
  setTimeout(() => sound.pause(), duration);
}

loadQuestions();
</script>

<style scoped>
/* Your existing styles */
.end-text p:first-of-type,
.end-text p:nth-of-type(2) {
  margin-top: 2cm;
}

.answer {
  margin-left: 2vw;
  margin-top: 1vw;
  float: left;
  height: 10vh;
  width: 47vw;
  font-size: 2vh;
}

#question-wrapper {
  float: left;
  margin-left: 2vw;
  margin-top: 2vw;
  height: 25vh;
  width: 47vw;
  border: 1px solid black;
}

#question {
  height: 25vh;
  width: 47vw;
  text-align: center;
  vertical-align: middle;
  display: table-cell;
}

#feedback {
  margin-left: 2vw;
  margin-top: 2vw;
  float: left;
  height: 25vh;
  width: 47vw;
}

.progress-bar {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  -webkit-box-shadow: inset 0 0 0 2px #212529 !important;
  -moz-box-shadow: inset 0 0 0 2px #212529 !important;
  box-shadow: inset 0 0 0 2px #212529 !important;
  border: none !important;
}

.progress {
  border-radius: 0 !important;
  background-color: white !important;
  -webkit-box-shadow: inset 0 0 0 2px #212529 !important;
  -moz-box-shadow: inset 0 0 0 2px #212529 !important;
  box-shadow: inset 0 0 0 2px #212529 !important;
  border: none !important;
}

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

.end-text {
  text-align: center;
  font-size: 6vh;
  color: white;
}

.loader {
  margin: auto;
  border: 16px solid #f3f3f3;
  border-top: 16px solid #3498db;
  border-radius: 20px;
  width: 2vw;
  height: 2vw;
  animation: spin 2s linear infinite;
}

.gold-text {
  color: gold;
  font-weight: bold;
}

.results-table-container {
  margin: 0 auto;
  width: 80%;
  max-height: 50vh;
  overflow-y: auto;
  border: 1px solid white;
}

.results {
  margin-top: 20px;
  text-align: center;
  color: white;
}

.results h2 {
  font-size: 4vh;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #006400;
  color: white;
  opacity: 0.75;
}

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


.green-bold {
  color: #6a2900;
  font-weight: bold;
}

#answers-list {
  position: relative;
}

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

.answer:hover .answer-info {
  display: block;
}

.outlined-text {
  text-shadow:
      -1px -1px 0 #fff,
      1px -1px 0 #fff,
      -1px 1px 0 #fff,
      1px 1px 0 #fff;
}




</style>
