export interface DetectedLanguage {
  readonly language: string;
  readonly percentage: number;
}

export interface LanguageDetectionResult {
  readonly isReliable: boolean;
  readonly languages: readonly DetectedLanguage[];
}

export interface I18nApi {
  getMessage(
    messageName: string,
    substitutions?: string | readonly string[],
  ): string;
  getUILanguage(): string;
  detectLanguage(text: string): Promise<LanguageDetectionResult>;
}
