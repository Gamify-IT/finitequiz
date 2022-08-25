<template>
  <div>
    <div v-if="currentQuestion">
      <div id="Question">{{ currentQuestion.text }}</div>
      <b-button
        v-for="answer in currentAnswers"
        :key="answer"
        class="Answer"
        variant="outline-info"
        v-on:click="chooseAnswer(answer)"
      >
        {{ answer }}
      </b-button>
    </div>
    <div v-if="showEndscreen">
      All questions answered! Achieved: {{ score * 100 }}%!
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

async function loadQuestions() {
  configurationId.value = window.location.hash.replace("#", "");
  getQuestions(configurationId.value).then((response) => {
    questions.value = response.data;
    initialQuestionCount.value = questions.value.length;
    showEndscreen.value = false;
    nextQuestion();
  });
}

function chooseAnswer(chosenAnswer: string) {
  let roundResult = new RoundResultDTO(
    currentQuestion.value.id,
    currentQuestion.value,
    chosenAnswer
  );
  if (chosenAnswer === currentQuestion.value.rightAnswer) {
    correctAnsweredQuestions.value.push(roundResult);
  } else {
    wrongAnsweredQuestions.value.push(roundResult);
  }
  nextQuestion();
}

function nextQuestion() {
  if (questions.value.length >= 1) {
    console.log("next question");
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
    score.value =
      correctAnsweredQuestions.value.length / initialQuestionCount.value;
    let result = new GameResultDTO(
      configurationId.value,
      correctAnsweredQuestions.value,
      wrongAnsweredQuestions.value,
      score.value,
      initialQuestionCount.value
    );
    postGameResult(result);
    resetValues();
    showEndscreen.value = true;
  }
}

function resetValues() {
  questions.value = Array<Question>();
  initialQuestionCount.value = 0;
  currentQuestion.value = null;
  currentAnswers.value = Array<Question>();
  correctAnsweredQuestions.value = Array<RoundResultDTO>();
  wrongAnsweredQuestions.value = Array<RoundResultDTO>();
}

loadQuestions();
</script>

<style scoped>
div {
  /*border: black solid 1px;*/
}

.Answer {
  margin-left: 2vw;
  margin-top: 1vw;
  float: left;
  height: 10vh;
  width: 47vw;
}

#Question {
  margin-left: 2vw;
  margin-top: 2vw;
  float: left;
  height: 25vh;
  width: 96vw;
  border: black solid 1px;
}
</style>
