export interface TranscriptItem {
  kode: string;
  mata_kuliah: string;
  nilai: string;
}

export interface ResultData {
  response: string;
  transcript_data?: TranscriptItem[] | string | null;
  error?: string;
}
