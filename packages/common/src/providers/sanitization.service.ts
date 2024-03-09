import { Injectable } from '@nestjs/common';

@Injectable()
export class SanitizationService {
  /**
   * Sanitizes a value for use in a search query. Sanitizes the value by
   * removing any characters that could be used to escape the query.
   * Alpha-numeric characters are allowed, as well as common punctuation, and
   * special characters and accents that are commonly used in Norwegian.
   * @param value The value to sanitize.
   * @returns The sanitized value.
   */
  sanitize(value: string): string {
    return value.replace(/[^a-zA-Z0-9æøåÆØÅéèÉÈáàÁÀäÄöÖüÜß\- ]/g, '');
  }
}
