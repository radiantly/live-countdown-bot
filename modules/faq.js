export const faq = {
  del: {
    q: "How do I delete a countdown?",
    a: "Just delete the message sent by the bot.",
  },
  exact: {
    q: "Why does `!countdown 1day` not count down 24 hours?",
    a:
      "This is because countdowns end exactly at 12AM GMT. If you'd like exactly 24 hours, use `!countdown 24hours`",
  },
  delmsg: {
    q: "Can the bot automatically delete the original message?",
    a: "Yes, you need to give it the `MANAGE_MESSAGES` permission.",
  },
  tz: [
    {
      q: "What is the default timezone of the bot?",
      a: "GMT/UTC",
      by: "TheMissing';'#6957",
    },
    {
      q: "Format to define your time-zone with reference to UTC/GMT",
      a: `\`UTC +/- 0x00\` 'x' being your zone offset.
Example for a countdown in: 
*GMT+5: \`!countdown 7:30 pm GMT+0500\`*
*UTC-6:  \`!countdown 7:30 pm UTC-0600\`*`,
      by: "Cerberus#9388",
    },
  ],
  restrict: [
    {
      q: "Can you restrict bot usage to specific roles?",
      a: "No.",
    },
    {
      q: "How can you restrict bot usage for now?",
      a:
        "Restrict the bot to a specific channel and only allow certain roles permissions to post in it.",
      by: "Cerberus#9388",
    },
  ],
  "1hr": {
    q: "Is the EST or CET or PT timezones 1 hour off?",
    a: "No, use EDT or CEST or PDT instead.",
  },
  prefix: {
    q: "How do I change the prefix for the bot?",
    a: `Type the following command:
\`!setprefix\` followed by whatever you want your prefix to be. For example, if I wanted my prefix to be \`$\`, I would type \`!setprefix $\``,
    by: "Loco Musician#0801",
  },
  timeleft: {
    q: "How do I see the time left?",
    a: "The bot edits the original message as the time passes by.",
  },
  max: {
    q: "What is the maximum number of countdowns I can have?",
    a:
      "You can have 5 inline countdowns per message, and you get 2 messages per channel, so that's a total of 10 countdowns per channel.",
  },
  tagrole: {
    q: "How do I tag a role once the countdown is over?",
    a: "Syntax: `!countdown tag ROLE_NAME DATE/TIME`",
  },
  seconds: {
    q: "Can the bot show seconds?",
    a: "No, as this would violate Discord's API rate limits.",
  },
  precision: {
    q: "Why does the bot only show days/hours?",
    a:
      "As the countdown grows nearer, the precision improves. If the countdown is less than:\n" +
      `2 days -> show minutes
2 weeks -> show hours
else show weeks/days`,
  },
  simple: {
    q: "I hear you're looking for a simple request structure.",
    a:
      "Simple request structures can look as follows:\n" +
      "```!countdown <#> <minutes/hours/days/months>```\n" +
      "```!countdown <tag> <month> <day>, <time> <zone>```\n\n" +
      "Realistic examples look as follows:\n" +
      "```!countdown 5days```\n" +
      "```!countdown tagme June 25, 3:00 PM CDT```",
  },
  complex: {
    q: "I hear you're looking for a complex request structure.",
    a:
      "Complex request structures can look as follows:\n" +
      "```<txt>!!countdown <#> <minutes/hours/days/months>!<txt>```\n" +
      "```<txt>!!countdown <tag> <month> <day>, <time> <zone>!<txt>```\n\n" +
      "Realistic examples look as follows:\n" +
      "```My countdown: !!countdown 5days! Yay!```\n" +
      "```My countdown: !!countdown June 25, 3:00 PM CDT! Yay!```\n\n",
  },
  qna1: {
    q:
      "Need more info? You've come to the right place! Here's some answers to commonly asked questions. Check page 2 if you don't find your answer here.",
    a:
      "~ You can stop or delete the countdown by deleting the message the bot reply to your request.\n" +
      "~ Sometimes the bot is looking for 24 hours instead of a day.\n" +
      "~ Give the bot `MANAGE_MESSAGES` to allow it to delete your requests. \n" +
      "~ The bots default time zone is UTC but can be modified in the countdown request.\n" +
      "~ The bot can only be made role specific by setting up a channel that only people with a certain role can type in.\n" +
      "~ Daylight savings applies to timezones (CST/CDT).",
  },
  qna2: {
    q: "Didn't find your answer? Its sure to be here somewhere..",
    a:
      "~ Change prefix using `!setprefix` followed by your desired prefix.\n" +
      "~ The message the bot replies with is the countdown, pin it or make the bot its own channel so it doesnt get lost.\n" +
      "~ You can have 5 inline countdowns per post. Up to 2 posts per channel. For a total of 10 per channel.\n" +
      "~ To tag people use `tag Username`. Sometimes @mentions dont work.\n" +
      "~ Due to rate limits the bot cannot show seconds.\n" +
      "~ The bot reduces update intervals towards the middle of countdowns. It's still spot on, it just doesn't update as often when people are likely not looking at it.",
  },
  qna3: {
    q: "Still didn't find your answer?",
    a:
      "Head over to our discord and someone will be able to assist you.\n" +
      "https://discord.com/invite/b2fY4z4xBY",
  },
};
