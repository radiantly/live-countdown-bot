const languages = {
  en: {
    longStrings: {
      lessThanAMinute: "less than a minute",
      minute: "minute",
      hour: "hour",
      day: "day",
      week: "week",
      and: "and",
    },
    shortStrings: {
      lessThanAMinute: "< 1min",
      minute: "min",
      hour: "hr",
      day: "day",
      week: "wk",
      and: "&",
    },
    timeLeft: "Time left",
    countdownDone: "Countdown done",
    inlineNoMinutes: "no minutes",
    countingDown: "Counting down",
  },
  de: {
    longStrings: {
      lessThanAMinute: "weniger als eine Minute",
      minute: "Minute",
      minutes: "Minuten",
      hour: "Stunde",
      hours: "Stunden",
      day: "Tag",
      days: "Tage",
      week: "Woche",
      weeks: "Wochen",
      and: "und",
    },
    timeLeft: "Verbleibende Zeit",
    countdownDone: "Countdown abgeschlossen",
    inlineNoMinutes: "keine Minuten",
  },
  es: {
    longStrings: {
      lessThanAMinute: "menos de un minuto",
      minute: "minuto",
      hour: "hora",
      day: "día",
      week: "semana",
      and: "y",
    },
    timeLeft: "Tiempo restante",
    countdownDone: "Tiempo restante terminado",
    inlineNoMinutes: "0 minutos",
  },
  nl: {
    longStrings: {
      lessThanAMinute: "minder dan een minuut",
      minute: "minuut",
      minutes: "minuten",
      hour: "uur",
      hours: "uren",
      day: "dag",
      days: "dagen",
      week: "week",
      weeks: "weken",
      and: "en",
    },
    timeLeft: "Tijd over",
    countdownDone: "Aftellen over",
    inlineNoMinutes: "0 minuten",
  },
  tr: {
    longStrings: {
      lessThanAMinute: "bir dakikadan az",
      minute: "dakika",
      minutes: "dakika",
      hour: "saat",
      hours: "saat",
      day: "gün",
      days: "gün",
      week: "hafta",
      weeks: "hafta",
      and: "ve",
    },
    timeLeft: "kaldı",
    countdownDone: "Geri sayım tamamlandı",
    inlineNoMinutes: "0 dakika",
    countingDown: "Geri sayım devam ediyor",
  },
  hu: {
    longStrings: {
      lessThanAMinute: "Kevesebb, mint egy perc",
      minute: "perc",
      minutes: "perc",
      hour: "óra",
      hours: "óra",
      day: "nap",
      days: "nap",
      week: "hét",
      weeks: "hét",
      and: "és",
    },
    timeLeft: "hátra lévő idő",
    countdownDone: "Visszaszámlálás kész!",
    inlineNoMinutes: "0 perc",
    countingDown: "visszaszámláló",
  },
};

export const availableLanguages = Object.keys(languages);

const getProp = (text, obj) => text.split(".").reduce((obj, val) => obj && obj[val], obj);

export const t = (text, langCode = "en") =>
  getProp(text, languages[langCode]) || getProp(text, languages.en);
