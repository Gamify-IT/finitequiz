<template>
  <div>
    <div id="Question">{{ currentQuestion }}</div>
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

<script>
import { getQuestions } from "@/ts/minigame-rest-client";

export default {
  name: "GameView",
  data() {
    return {
      questions: [],
      currentQuestion: "",
      currentAnswers: [],
      currentRightAnswer: "",
      currentWrongAnswers: [],
    };
  },
  methods: {
    async loadQuestions() {
      this.questions = await getQuestions(
        "70fcd00c-b67c-46f2-be73-961dc0bc8de1"
      );
      console.log(this.questions);
      this.nextQuestion();
    },
    nextQuestion() {
      let number = Math.floor(Math.random() * this.questions.data.size);
      this.currentQuestion = this.questions.data[number];
      this.questions.data.splice(number, 1);
      this.currentAnswers = this.currentQuestion.wrongAnswers;
      this.currentRightAnswer = this.currentQuestion.rightAnswer;
      this.currentAnswers.push(this.currentRightAnswer);
    },
  },
  created() {
    this.loadQuestions();
  },
};
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
