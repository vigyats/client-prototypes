// Simple translation utility using LibreTranslate or MyMemory API

type Lang = "en" | "hi" | "mr";

const LANG_CODES: Record<Lang, string> = {
  en: "en",
  hi: "hi",
  mr: "mr",
};

async function translateText(text: string, fromLang: Lang, toLang: Lang): Promise<string> {
  if (fromLang === toLang || !text.trim()) {
    return text;
  }

  try {
    // Using MyMemory Translation API (free, no API key required)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${LANG_CODES[fromLang]}|${LANG_CODES[toLang]}`
    );
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    return text; // Return original if translation fails
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text on error
  }
}

export async function translateContent(
  title: string,
  summary: string,
  contentHtml: string,
  fromLang: Lang,
  toLangs: Lang[]
): Promise<Record<Lang, { title: string; summary: string; contentHtml: string }>> {
  const translations: Record<string, { title: string; summary: string; contentHtml: string }> = {};

  // Add source language
  translations[fromLang] = { title, summary, contentHtml };

  // Translate to other languages
  for (const toLang of toLangs) {
    if (toLang === fromLang) continue;

    try {
      // Extract text from HTML for translation
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = contentHtml;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";

      // Translate each field
      const [translatedTitle, translatedSummary, translatedContent] = await Promise.all([
        translateText(title, fromLang, toLang),
        translateText(summary, fromLang, toLang),
        translateText(plainText, fromLang, toLang),
      ]);

      // Wrap translated content back in basic HTML
      const translatedHtml = `<p>${translatedContent.replace(/\n/g, "</p><p>")}</p>`;

      translations[toLang] = {
        title: translatedTitle,
        summary: translatedSummary,
        contentHtml: translatedHtml,
      };
    } catch (error) {
      console.error(`Translation to ${toLang} failed:`, error);
      // Use original content if translation fails
      translations[toLang] = { title, summary, contentHtml };
    }
  }

  return translations as Record<Lang, { title: string; summary: string; contentHtml: string }>;
}
