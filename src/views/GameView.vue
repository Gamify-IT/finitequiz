<template>
  <div v-if="currentQuestion != undefined">
    <div id="Question">{{ currentQuestion.text }}</div>
    <b-button @click="nextQuestion"></b-button>
    <b-button
      v-for="answer in currentAnswers"
      :key="answer"
      class="Answer"
      variant="outline-info"
    >
      {{ answer }}
    </b-button>
  </div>
</template>

<script setup lang="ts">
import { getQuestions } from "@/ts/minigame-rest-client";
import { ref } from "vue";
import { Question } from "@/ts/models";

const questions = ref(Array<Question>());
const currentQuestion = ref();
const currentAnswers = ref(Array<Question>());

async function loadQuestions() {
  getQuestions("70fcd00c-b67c-46f2-be73-961dc0bc8de1").then((response) => {
    questions.value = response.data;
    nextQuestion();
  });
}

function nextQuestion() {
  console.log("next question");
  let number = Math.floor(Math.random() * questions.value.length);
  currentQuestion.value = questions.value[number];
  questions.value.splice(number, 1);
  currentAnswers.value = currentQuestion.value.wrongAnswers;
  currentAnswers.value.push(currentQuestion.value.rightAnswer);
}

loadQuestions();
</script>

<style scoped>
div {
  border: black solid 1px;
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
}
</style>
