import { createContext, useContext, useEffect, useMemo, useState, PropsWithChildren } from "react";

export type Lang = "en" | "hi" | "mr";

const STORAGE_KEY = "ngo.lang";

const dict = {
  en: {
    brand: "Civic Impact Studio",
    tagline: "Projects, events, and public-good work — beautifully documented.",
    nav: { home: "Home", projects: "Projects", events: "Events", admin: "Admin" },
    actions: { login: "Admin Login", logout: "Logout", open: "Open", viewAll: "View all", create: "Create", update: "Update" },
    labels: {
      featuredProjects: "Featured Projects",
      allProjects: "All Projects",
      events: "Events",
      upcoming: "Upcoming",
      previous: "Previous",
      language: "Language",
      cover: "Cover",
      translations: "Translations",
    },
    empty: {
      featured: "No featured projects yet.",
      projects: "No projects yet.",
      events: "No events yet.",
    },
  },
  hi: {
    brand: "सिविक इम्पैक्ट स्टूडियो",
    tagline: "परियोजनाएँ, कार्यक्रम और जनहित कार्य — सटीकता से प्रस्तुत।",
    nav: { home: "होम", projects: "परियोजनाएँ", events: "कार्यक्रम", admin: "एडमिन" },
    actions: { login: "एडमिन लॉगिन", logout: "लॉगआउट", open: "खोलें", viewAll: "सभी देखें", create: "बनाएँ", update: "अपडेट" },
    labels: {
      featuredProjects: "विशेष परियोजनाएँ",
      allProjects: "सभी परियोजनाएँ",
      events: "कार्यक्रम",
      upcoming: "आगामी",
      previous: "पिछले",
      language: "भाषा",
      cover: "कवर",
      translations: "अनुवाद",
    },
    empty: {
      featured: "अभी कोई विशेष परियोजना नहीं है।",
      projects: "अभी कोई परियोजना नहीं है।",
      events: "अभी कोई कार्यक्रम नहीं है।",
    },
  },
  mr: {
    brand: "सिव्हिक इम्पॅक्ट स्टुडिओ",
    tagline: "प्रकल्प, कार्यक्रम आणि लोकहित कार्य — दर्जेदार मांडणी.",
    nav: { home: "मुख्य", projects: "प्रकल्प", events: "कार्यक्रम", admin: "अ‍ॅडमिन" },
    actions: { login: "अ‍ॅडमिन लॉगिन", logout: "लॉगआउट", open: "उघडा", viewAll: "सर्व पहा", create: "तयार करा", update: "अपडेट" },
    labels: {
      featuredProjects: "वैशिष्ट्यपूर्ण प्रकल्प",
      allProjects: "सर्व प्रकल्प",
      events: "कार्यक्रम",
      upcoming: "आगामी",
      previous: "मागील",
      language: "भाषा",
      cover: "कव्हर",
      translations: "भाषांतर",
    },
    empty: {
      featured: "सध्या कोणतेही वैशिष्ट्यपूर्ण प्रकल्प नाहीत.",
      projects: "सध्या कोणतेही प्रकल्प नाहीत.",
      events: "सध्या कोणतेही कार्यक्रम नाहीत.",
    },
  },
} as const;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof dict.en;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "hi" || stored === "mr") setLang(stored as Lang);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => dict[lang], [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
