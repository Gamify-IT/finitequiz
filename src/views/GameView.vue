<template>
  <div>
    <div class="progress">
      <div
        name="progress-bar"
        class="progress-bar"
        role="progressbar"
        style="width: 0%"
        aria-valuenow="{{initialQuestionCount-questions.length}}"
        aria-valuemin="0"
        aria-valuemax="{{initialQuestionCount}}"
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
        v-on:click="chooseAnswer($event, answer)"
      >
        {{ answer }}
      </b-button>
    </div>
    <div id="end-text-wrapper" v-if="showEndscreen">
      <div id="end-text">
        Finished! Answered {{ correctAnsweredQuestions.length }} of
        {{ correctAnsweredQuestions.length + wrongAnsweredQuestions.length }}
        questions right!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getQuestions, postGameResult } from "@/ts/minigame-rest-client";
import { ref } from "vue";
import { GameResultDTO, Question, RoundResultDTO } from "@/ts/models";

const configurationId = ref("");
const questions = ref(Array<Question>());
const initialQuestionCount = ref(0);
const currentQuestion = ref();
const currentAnswers = ref(Array<Question>());
const correctAnsweredQuestions = ref(Array<RoundResultDTO>());
const wrongAnsweredQuestions = ref(Array<RoundResultDTO>());
const showEndscreen = ref(false);
const score = ref(0);
const buttonsDisabled = ref(false);

async function loadQuestions() {
  let locationArray = window.location.toString().split("/");
  configurationId.value = locationArray[locationArray.length - 1];
  getQuestions(configurationId.value).then((response) => {
    questions.value = response.data;
    initialQuestionCount.value = questions.value.length;
    showEndscreen.value = false;
    nextQuestion();
  });
}

function chooseAnswer(buttonTarget: any, chosenAnswer: string) {
  buttonsDisabled.value = true;
  const buttonName = buttonTarget.currentTarget.name;
  let roundResult = new RoundResultDTO(
    currentQuestion.value.id,
    currentQuestion.value,
    chosenAnswer
  );
  if (chosenAnswer === currentQuestion.value.rightAnswer) {
    correctAnsweredQuestions.value.push(roundResult);

    document.getElementsByName(buttonName)[0].style.backgroundColor = "green";
  } else {
    wrongAnsweredQuestions.value.push(roundResult);
    document.getElementsByName(buttonName)[0].style.backgroundColor = "red";
  }
  score.value =
    correctAnsweredQuestions.value.length / initialQuestionCount.value;
  document.getElementsByName("progress-bar")[0].style.width =
    (
      ((initialQuestionCount.value - questions.value.length) /
        initialQuestionCount.value) *
      100
    ).toString() + "%";
  delay(1000)
    .then(() => resetCurrentAnswers())
    .then(() => nextQuestion());
}

function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function resetCurrentAnswers() {
  currentAnswers.value = [];
}

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
    let result = new GameResultDTO(
      configurationId.value,
      correctAnsweredQuestions.value,
      wrongAnsweredQuestions.value,
      score.value,
      initialQuestionCount.value
    );
    postGameResult(result).catch((reason) => {
      alert(reason.data.message());
    });
    resetValues();
    showEndscreen.value = true;
  }
}

function resetValues() {
  questions.value = Array<Question>();
  currentQuestion.value = null;
  currentAnswers.value = Array<Question>();
}

loadQuestions();
</script>

<style scoped>
div {
  /*border: black solid 1px;*/
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
  border: black solid 1px;
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
  width: 99vw;
}

#end-text {
  height: 90vh;
  width: 99vw;
  text-align: center;
  vertical-align: middle;
  display: table-cell;
  font-size: 6vh;
}
</style>
