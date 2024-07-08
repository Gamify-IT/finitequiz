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
          Current score: {{ correctAnsweredQuestions.length }} /
          {{ correctAnsweredQuestions.length + wrongAnsweredQuestions.length }}
        </h1>
      </div>
      <b-button
          v-for="answer in currentAnswers"
          :key="answer"
          class="answer"
          variant="outline-info"
          :name="'buttonId' + answer"
          :disabled="buttonsDisabled"
          @click="chooseAnswer($event, answer)"
      >
        {{ answer }}
      </b-button>
    </div>

    <div v-if="loading" class="loader"></div>

    <div id="end-text-wrapper" v-if="showEndscreen">
      <div v-if="!error" class="end-text">
        <h1>Quiz Finished!</h1>
        <p>
          You answered {{ correctAnsweredQuestions.length }} of
          {{ correctAnsweredQuestions.length + wrongAnsweredQuestions.length }}
          questions correctly.
        </p>
        <p>
          You've earned
          <span class="gold-text">{{ store.state.rewards }}</span> coins!
        </p>
        <p v-if="store.state.rewards <= 4">Don't give up! You will get there!</p>
        <p v-else-if="store.state.rewards <= 7">Good job!</p>
        <p v-else>Wow! Congratulations!</p>

        <div class="results">
          <h2>Results Summary:</h2>
        </div>
        <div class="results-table">
          <table>
            <thead>
            <tr>
              <th>Question</th>
              <th>Correct Answer</th>
              <th>Result</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(result, index) in correctAnsweredQuestions" :key="'correct' + index">
              <td>{{ result.question.text }}</td>
              <td>{{ result.question.rightAnswer }}</td>
              <td><span class="result-icon green">&#10004;</span></td>
            </tr>
            <tr v-for="(result, index) in wrongAnsweredQuestions" :key="'wrong' + index">
              <td>{{ result.question.text }}</td>
              <td>{{ result.question.rightAnswer }}</td>
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

loadQuestions();
</script>

<style scoped>
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
  height: 90vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.end-text {
  text-align: center;
  font-size: 6vh;
}

.loader {
  margin: auto; 
  border: 16px solid #f3f3f3;
  border-top: 16px solid #3498db;
  border-radius: 50%;
  width: 2vw;
  height: 2vw;
  animation: spin 2s linear infinite;
}

.gold-text {
  color: gold;
  font-weight: bold;
}

.results {
  margin-top: 20px;
  text-align: center;
}

.results h2 {
  font-size: 4vh;
}

.results-table {
  margin: 20px 0;
  width: 90%;
  max-width: 800px;
  border-collapse: collapse;
}

.results-table th,
.results-table td {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: left;
  font-size: 1.6vh;
}

.results-table th {
  background-color: #f2f2f2;
  font-size: 1.8vh;
}

.results-table .result-icon {
  font-size: 1.4vh;
  line-height: 1.2;
}

.results-table .result-icon.green {
  color: green;
}

.results-table .result-icon.red {
  color: red;
}
</style>