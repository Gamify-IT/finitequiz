import { Config, GameResultDTO, Question, RoundResultDTO } from "@/ts/models";

describe("models.ts", () => {
  test("test models", () => {
    const question = new Question("id", "question text", [
      "wrong answer one",
      "wrong answer two",
    ], [
      { uuid: "3", text: "wrong answer one" },
      { uuid: "4", text: "wrong answer two" },
    ], "123");
    expect(question.wrongAnswers.length).toBe(2);
    const config = new Config([question]);
    expect(config.questions.length).toBe(1);
    const roundResultDTO = new RoundResultDTO("id", question, "right answer");
    expect(roundResultDTO.answer).toBe("right answer");
    const gameResultDTO = new GameResultDTO(
      "config",
      [roundResultDTO],
      [],
      1,
      1,
      60,
      2
    );
    expect(gameResultDTO.score).toBe(1);
  });
});
