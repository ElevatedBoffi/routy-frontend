
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AiService {
  isTranslating = signal(false);

  // Inserirai qui l'URL che ti darà Render dopo il deploy (es. https://routy-backend.onrender.com)
  private API_URL = 'https://routy-backend.onrender.com'; 

  async translatePost(originalText: string, targetLang: string = 'English'): Promise<string> {
    this.isTranslating.set(true);

    try {
      // Se l'URL non è ancora configurato, torna il testo originale
      if (this.API_URL.includes('TUO-SERVER')) {
        console.warn('Backend URL not set. Returning mock translation.');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `[MOCK ${targetLang}]: ${originalText}`;
      }

      const response = await fetch(`${this.API_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          target_lang: targetLang
        })
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      return data.translated_text;

    } catch (e) {
      console.error("AI Service Error:", e);
      return "Translation currently unavailable.";
    } finally {
      this.isTranslating.set(false);
    }
  }
}
