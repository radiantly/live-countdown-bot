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
};

export const availableLanguages = Object.keys(languages);

const getProp = (text, obj) => text.split(".").reduce((obj, val) => obj && obj[val], obj);

export const t = (text, langCode = "en") =>
  getProp(text, languages[langCode]) || getProp(text, languages.en);
