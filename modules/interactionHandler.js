import * as timer from "./commands/timer.js";
import * as permissionCheck from "./commands/permissionCheck.js";
import * as remindMeIn from "./commands/remindMeIn.js";
import * as sendToDM from "./commands/sendToDM.js";

export const interactionHandler = interaction => {
  const { commandName } = interaction;
  for (const item of [timer, permissionCheck, remindMeIn, sendToDM])
    if (commandName === item.command.name) return item.handler(interaction);
};
