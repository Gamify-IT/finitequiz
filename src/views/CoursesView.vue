<script setup lang="ts">
import { ICourse } from "@/ts/models";
import { getCourses, postCourse } from "@/ts/course-rest-client";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const courses = ref(Array<ICourse>());

const router = useRouter();

const toast = useToast();

let nameInput = ref();
let descriptionInput = ref();
let semesterInput = ref();

async function loadCourses() {
  getCourses()
    .then((response) => {
      courses.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

function directToCourse(id: string) {
  console.log("Course:" + id);
  router.push("/courses/" + id);
}

const fields = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "courseName",
    label: "Course Name",
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "semester",
    label: "Semester",
  },
];

loadCourses();

function handleOk() {
  console.log(
    "create Course name: " +
      nameInput.value +
      ", description: " +
      descriptionInput.value +
      ", in the semester" +
      semesterInput.value
  );
  postCourse({
    courseName: nameInput.value,
    description: descriptionInput.value,
    semester: semesterInput.value,
  })
    .then((response) => {
      courses.value.push(response.data);
      toast.success(`Course ${response.data.courseName} is created!`);
    })
    .catch((error) => {
      toast.error(`Course ${nameInput.value} could not be created created!`);
      console.log(error);
    });
}

function resetModal() {
  nameInput.value = "";
  descriptionInput.value = "";
  semesterInput.value = "";
}
</script>

<template>
  <div class="container mt-4">
    <b-table bordered striped hover :fields="fields" :items="courses">
      <template
        v-for="(field, index) in fields"
        :key="index"
        #[`cell(${field.key})`]="data"
      >
        <b-row
          v-if="data.item.active"
          class="table-row-active table-cursor"
          @click="directToCourse(data.item.id)"
        >
          {{ data.value }}</b-row
        >
        <b-row
          v-else
          class="table-row-inactive table-cursor"
          @click="directToCourse(data.item.id)"
        >
          {{ data.value }}</b-row
        >
      </template>
    </b-table>
    <b-button variant="success" v-b-modal.create-course>
      create new course
    </b-button>
    <b-modal
      title="Create course"
      id="create-course"
      @show="resetModal"
      @ok="handleOk"
    >
      <form ref="form" @submit.stop.prevent="">
        <b-form-group label="Name" label-for="name">
          <b-form-input id="name" v-model="nameInput"></b-form-input>
        </b-form-group>

        <b-form-group label="Description" label-for="description">
          <b-form-input
            id="description"
            v-model="descriptionInput"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Semester in the format (WS/SS)-year(22)"
          label-for="semester"
        >
          <b-form-input id="semester" v-model="semesterInput"></b-form-input>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<style>
.table-cursor {
  cursor: pointer;
}
.table-row-active {
  padding-left: 5px;
}
.table-row-inactive {
  padding-left: 5px;
  color: grey;
}
</style>
