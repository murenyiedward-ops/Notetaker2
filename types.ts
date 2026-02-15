export enum MeetingType {
  GENERAL = 'general',
  SALES = 'sales',
  TECHNICAL = 'technical',
  BRAINSTORM = 'brainstorm'
}

export enum MeetingLanguage {
  MULTILINGUAL = 'multilingual',
  KISWAHILI = 'kiswahili',
  ENGLISH = 'english'
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export interface NoteResponse {
  markdown: string;
}

export interface ImageResponse {
  imageUrl: string;
}
