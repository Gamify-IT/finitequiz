export class Question {
  id: string;
  text: string;
  rightAnswer: string;
  wrongAnswers: string[];

  public constructor(id: string, text: string,  rightAnswer: string, wrongAnswers: string[]) {
    this.id = id;
    this.text = text;
    this.rightAnswer = rightAnswer;
    this.wrongAnswers = wrongAnswers;
  }
}

export interface IConfig {
  questions: Question[]
}

export class Config implements IConfig {
  questions: Question[];

  public constructor(questions: Question[]) {
    this.questions = questions;
  }
}