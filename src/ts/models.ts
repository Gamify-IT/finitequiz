export class WrongAnswer {
  uuid: string;
  text: string;

  public constructor(uuid: string, text: string) {
    this.uuid = uuid;
    this.text = text;
  }
}

/**
 * This file defines all the needed type-correct models
 */
export class Question {
  id: string;
  text: string;
  rightAnswer: [string, string];
  wrongAnswers: WrongAnswer[];
  uuid: string;

  public constructor(
    id: string,
    text: string,
    rightAnswer: [string, string],
    wrongAnswers: WrongAnswer[],
    uuid: string
  ) {
    this.id = id;
    this.text = text;
    this.rightAnswer = rightAnswer;
    this.wrongAnswers = wrongAnswers;
    this.uuid = uuid;
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
  questionUUId: string;
  question: Question;
  answer: string;

  public constructor(questionUUId: string, question: Question, answer: string) {
    this.questionUUId = questionUUId;
    this.question = question;
    this.answer = answer;
  }
}

export class GameResultDTO {
  public constructor(
    public configurationAsUUID: string,
    public correctAnsweredQuestions: Array<RoundResultDTO>,
    public wrongAnsweredQuestions: Array<RoundResultDTO>,
    public score: number,
    public questionCount: number,
    public timeSpent: number,
    public rewards: number
  ) {}
}


