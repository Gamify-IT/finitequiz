<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";
import {
  IChickenshockQuestion,
  ITask,
  ChickenshockConfiguration,
} from "@/ts/models";
import {
  getChickenshockConfig,
  postChickenshockConfig,
} from "@/ts/chickenshock-rest-client";
import { useToast } from "vue-toastification";
import { putMinigame } from "@/ts/minigame-rest-client";
import { useRoute } from "vue-router";

const props = defineProps<{
  minigame: ITask;
  showModal: boolean;
}>();

const fields = [
  {
    key: "text",
    label: "Question",
  },
  {
    key: "rightAnswer",
    label: "Correct Answer",
  },
  {
    key: "wrongAnswers",
    label: "wrong Answers",
  },
  {
    key: "remove",
    label: "remove",
  },
];

const route = useRoute();
const courseId = ref(route.params.courseId as string);
const worldIndex = ref(route.params.worldIndex as string);
const dungeonIndex = ref(route.params.dungeonIndex as string);
const toast = useToast();
const minigame = ref(props.minigame);
const form = ref();
const showModal = ref(props.showModal);
let configuration = ref(new ChickenshockConfiguration([]));
const question = ref();
const rightAnswer = ref();
const showQuestionModal = ref();
const oldMinigame = ref();
const wrongAnswers = ref(Array<string>());
const wrongAnswer = ref();

watch(
  () => props.minigame,
  (newMinigame) => {
    minigame.value = newMinigame;
  },
  { deep: true }
);

watch(
  () => props.showModal,
  (newBoolean) => {
    showModal.value = newBoolean;
  },
  { deep: true }
);

const emit = defineEmits<{
  (e: "updateMinigameConfiguration", minigame: ITask): void;
  (e: "closedModal"): void;
}>();

function checkFormValidity(): boolean {
  return form.value.checkValidity();
}

function resetModal() {
  if (minigame.value.configurationId != undefined) {
    getChickenshockConfig(minigame.value.configurationId)
      .then((response) => {
        configuration.value = response.data;
      })
      .catch((error) => {
        console.log(error);
        if (error.response.status == 404) {
          minigame.value.configurationId = undefined;
          configuration.value.questions = [];
        }
      });
    oldMinigame.value = minigame.value;
  } else {
    configuration.value.questions = [];
    oldMinigame.value = minigame.value;
  }
  console.log("Reset Modal");
}

function handleOk() {
  postChickenshockConfig(configuration.value)
    .then((response) => {
      minigame.value.configurationId = response.data.id;
      console.log("Submit Modal");
      console.log("id:" + response.data.id);
      console.log("minigameId" + minigame.value.configurationId);
      oldMinigame.value = minigame.value;
      handleSubmit();
    })
    .then(() => {
      putMinigame(
        parseInt(courseId.value),
        parseInt(worldIndex.value),
        parseInt(dungeonIndex.value),
        minigame.value
      );
    });
}

function handleSubmit() {
  // Exit when the form isn't valid
  if (!checkFormValidity()) {
    return;
  }
  resetModal();
  emit("updateMinigameConfiguration", minigame.value);
}

function hiddenModal() {
  if (!showQuestionModal.value) {
    oldMinigame.value = null;
    console.log("Test");
  }
  console.log("Modal hidden");
  emit("closedModal");
}

function loadModal() {
  if (oldMinigame.value != null) {
    if (oldMinigame.value.id != minigame.value.id) {
      resetModal();
    }
  } else {
    resetModal();
  }
}

function removeQuestion(text: string) {
  let filteredQuestions: IChickenshockQuestion[] = [];
  configuration.value.questions.forEach((question) => {
    if (question.text != text) {
      filteredQuestions.push(question);
    }
  });
  console.log(filteredQuestions);
  configuration.value.questions = filteredQuestions;
}

function handleQuestionOk() {
  let contains = false;
  configuration.value.questions.forEach((pQuestion) => {
    if (pQuestion.text == question.value) {
      contains = true;
    }
  });
  if (!contains) {
    configuration.value.questions.push({
      text: question.value,
      rightAnswer: rightAnswer.value,
      wrongAnswers: wrongAnswers.value,
    });
  } else {
    toast.error("Question already exists");
  }
  showModal.value = true;
}

function handleQuestionAbort() {
  showModal.value = true;
}

function resetQuestionModal() {
  question.value = "";
  rightAnswer.value = "";
  wrongAnswers.value = [];
  wrongAnswer.value = "";
}

function addWrongAnswer() {
  wrongAnswers.value.push(wrongAnswer.value);
  wrongAnswer.value = "";
}
</script>
<template>
  <b-modal
    title="Edit Chickenshock configuration"
    id="edit-modal"
    v-model="showModal"
    @hidden="hiddenModal"
    @ok="handleOk"
    @cancel="resetModal"
    @show="loadModal"
    @abort="resetModal"
  >
    <form
      ref="form"
      @submit.stop.prevent="handleSubmit"
      v-if="minigame !== undefined"
    >
      <b-form-group>
        <b-button
          variant="success"
          id="add-question-button"
          v-b-modal.add-question
        >
          add question
        </b-button>
      </b-form-group>
      <b-form-group>
        <b-table :fields="fields" :items="configuration.questions">
          <template #cell(wrongAnswers)="data">
            <div v-for="answer in data.value" :key="answer">
              <span>{{ answer }}</span>
            </div>
          </template>
          <template #cell(remove)="row">
            <b-button
              size="sm"
              variant="danger"
              @click="removeQuestion(row.item.text)"
            >
              <em class="bi bi-trash"></em>
            </b-button>
          </template>
        </b-table>
      </b-form-group>
    </form>
  </b-modal>
  <b-modal
    id="add-question"
    title="Add Question to Chickenshock configuration"
    v-model="showQuestionModal"
    @hidden="resetQuestionModal"
    @show="resetQuestionModal"
    @ok="handleQuestionOk"
    @cancel="handleQuestionAbort"
  >
    <b-form-group label="Question" label-for="question-input">
      <b-form-input id="question-input" v-model="question" required />
    </b-form-group>
    <b-form-group label="Correct Answer" label-for="correct-answer">
      <b-form-input id="correct-answer" v-model="rightAnswer" required />
    </b-form-group>
    <b-form-group label="Wrong Answers">
      <div v-for="answer in wrongAnswers" :key="answer">
        {{ answer }}
      </div>
      <div>
        <b-form-input
          @keydown.enter="addWrongAnswer"
          id="wrong-answer"
          v-model="wrongAnswer"
        ></b-form-input>
        <b-button
          @click="addWrongAnswer"
          variant="success"
          id="button-wrong-answer"
          >add</b-button
        >
      </div>
    </b-form-group>
  </b-modal>
</template>
