import { mount, VueWrapper, flushPromises } from "@vue/test-utils";
import mockAxios from "jest-mock-axios";
import router from "@/router/index";
import CoursesView from "@/views/CoursesView.vue";
import { Course, ICourse } from "@/ts/models";
import BootstrapVue3, { BRow } from "bootstrap-vue-3";
import config from "@/config";

jest.mock("axios");

describe("CoursesView.vue", () => {
  let wrapper: VueWrapper;
  let courses: ICourse[];
  beforeEach(async () => {
    jest.clearAllMocks();
    const coursesResponse = {
      data: [
        new Course(
          1,
          "PSE",
          "WS-22",
          "Course to teach students basics",
          true,
          []
        ),
      ],
    };
    courses = coursesResponse.data;
    // response for GET /courses
    mockAxios.get.mockResolvedValueOnce(coursesResponse);
    router.push("/");
    await router.isReady();
    wrapper = mount(CoursesView, {
      global: {
        plugins: [router, BootstrapVue3],
      },
    });
  });
  test("CoursesView.vue displays all received courses", async () => {
    expect(mockAxios.get).toHaveBeenCalledWith(`${config.apiBaseUrl}/courses`);

    let course: ICourse;

    let selectedCourse: ICourse | undefined;
    let selectedCourseComponent;
    for (course of courses) {
      const rowComponents = wrapper.findAllComponents(BRow);
      const courseComponent = rowComponents.find((row) =>
        row.html().includes(course.courseName)
      );
      expect(courseComponent != null).toBe(true);
      expect(courseComponent?.text()).toBe(course.courseName);
      expect(wrapper.html()).toContain(course.courseName);

      selectedCourse = course;
      selectedCourseComponent = courseComponent;
    }
    expect(selectedCourseComponent != undefined).toBe(true);
    selectedCourseComponent?.trigger("click");

    await flushPromises();
    expect(router.currentRoute.value.fullPath).toBe(
      `/courses/${selectedCourse?.id}`
    );
  });
});
