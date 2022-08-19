export interface ICourse {
  id: number;
  semester: string;
  courseName: string;
  description: string;

  active: boolean;
  worlds: IWorld[];
}

export interface IArea {
  id: string;
  index: number;
  staticName: string;
  topicName: string;
  active: boolean;
  minigameTasks: ITask[];
  npcs: INPC[];
}

export interface IWorld extends IArea {
  id: string;
  index: number;
  staticName: string;
  topicName: string;
  active: boolean;
  dungeons: IDungeon[];
  minigameTasks: ITask[];
  npcs: INPC[];
}

export interface IDungeon extends IArea {
  id: string;
  index: number;
  staticName: string;
  topicName: string;
  active: boolean;
  minigameTasks: ITask[];
  npcs: INPC[];
}

export interface ITask {
  id: string;
  index: number;
  game: Minigame;
  configurationId: string;
}

export interface INPC {
  id: string;
  index: number;
  text: string[];
}

export interface CourseInitialData {
  courseName: string;
  description: string;
  semester: string;
}

export interface IChickenshockConfiguration {
  id?: string;
  questions: IChickenshockQuestion[];
}

export interface IChickenshockQuestion {
  id?: string;
  text: string;
  rightAnswer: string;
  wrongAnswers: string[];
}

export enum Minigame {
  NONE = "NONE",
  CHICKENSHOCK = "CHICKENSHOCK",
  BUGFINDER = "BUGFINDER",
  REGEX_GAME = "REGEX-GAME",
  CROSSWORDPUZZLE = "CROSSWORDPUZZLE",
  GIT_CARD_GAME = "GIT-CARD-GAME",
  UML_GAME = "UML-GAME",
}

export class ChickenshockConfiguration implements IChickenshockConfiguration {
  id?: string;
  questions: IChickenshockQuestion[];
  public constructor(questions: IChickenshockQuestion[]) {
    this.questions = questions;
  }
}

export class Course implements ICourse {
  id: number;
  courseName: string;
  semester: string;
  description: string;
  active: boolean;
  worlds: IWorld[];

  public constructor(
    id: number,
    courseName: string,
    semester: string,
    description: string,
    active: boolean,
    worlds: IWorld[]
  ) {
    this.id = id;
    this.semester = semester;
    this.courseName = courseName;
    this.description = description;
    this.active = active;
    this.worlds = worlds;
  }
}

export class World implements IWorld {
  id: string;
  index: number;
  staticName: string;
  topicName: string;
  active: boolean;
  dungeons: IDungeon[];
  minigameTasks: ITask[];
  npcs: INPC[];

  public constructor(
    id: string,
    index: number,
    staticName: string,
    topicName: string,
    active: boolean,
    dungeons: IDungeon[],
    minigameTasks: ITask[],
    npcs: INPC[]
  ) {
    this.id = id;
    this.index = index;
    this.staticName = staticName;
    this.topicName = topicName;
    this.active = active;
    this.dungeons = dungeons;
    this.minigameTasks = minigameTasks;
    this.npcs = npcs;
  }
}

export class Dungeon implements IDungeon {
  id: string;
  index: number;
  staticName: string;
  topicName: string;
  active: boolean;
  minigameTasks: ITask[];
  npcs: INPC[];

  public constructor(
    id: string,
    index: number,
    staticName: string,
    topicName: string,
    active: boolean,
    minigameTasks: ITask[],
    npcs: INPC[]
  ) {
    this.id = id;
    this.index = index;
    this.staticName = staticName;
    this.topicName = topicName;
    this.active = active;
    this.minigameTasks = minigameTasks;
    this.npcs = npcs;
  }
}

export class Task implements ITask {
  id: string;
  index: number;
  game: Minigame;
  configurationId: string;

  public constructor(
    id: string,
    index: number,
    game: Minigame,
    configurationId: string
  ) {
    this.id = id;
    this.index = index;
    this.game = game;
    this.configurationId = configurationId;
  }
}

export class NPC implements INPC {
  id: string;
  index: number;
  text: string[];

  public constructor(id: string, index: number, text: string[]) {
    this.id = id;
    this.index = index;
    this.text = text;
  }
}

export function isWorld(area: any) {
  return area.dungeons;
}
