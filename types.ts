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

export enum ImageAspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '4:3',
  PORTRAIT = '3:4',
  WIDE = '16:9'
}

export interface NoteResponse {
  markdown: string;
}

export interface ImageResponse {
  imageUrl: string;
}