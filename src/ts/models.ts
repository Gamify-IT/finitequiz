export class Question {
  id: string;
  text: string;
  rightAnswer: string;
  wrongAnswers: string[];

  public constructor(
    id: string,
    text: string,
    rightAnswer: string,
    wrongAnswers: string[]
  ) {
    this.id = id;
    this.text = text;
    this.rightAnswer = rightAnswer;
    this.wrongAnswers = wrongAnswers;
  }
}

export interface IConfig {
  questions: Question[];
}

export class Config implements IConfig {
  questions: Question[];

  public constructor(questions: Question[]) {
    this.questions = questions;
  }
}

export class RoundResultDTO {
  question: Question;
  answer: string;

  public constructor(question: Question, answer: string) {
    this.question = question;
    this.answer = answer;
  }
}

export class GameResultDTO {
  configurationId: string;
  correctAnsweredQuestions: Array<RoundResultDTO>;
  wrongAnsweredQuestions: Array<RoundResultDTO>;
  score: number;
  questionCount: number;

  public constructor(
    configurationId: string,
    correctAnsweredQuestions: Array<RoundResultDTO>,
    wrongAnsweredQuestions: Array<RoundResultDTO>,
    score: number,
    questionCount: number
  ) {
    this.configurationId = configurationId;
    this.correctAnsweredQuestions = correctAnsweredQuestions;
    this.wrongAnsweredQuestions = wrongAnsweredQuestions;
    this.score = score;
    this.questionCount = questionCount;
  }
}
