import { MessageActionRow, MessageSelectMenu } from "discord.js";

export const command = {
  type: 3,
  name: "Remind me in ..",
};

export const handler = async interaction => {
  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId("remindMeTime")
      .setPlaceholder("Nothing selected..")
      .addOptions([
        {
          label: "Select me",
          description: "This is a description",
          value: "first_option",
        },
        {
          label: "You can select me too",
          description: "This is also a description",
          value: "second_option",
        },
      ])
  );
  console.log("Remind me: ", interaction);
  interaction.reply({
    content: "When would you like to be reminded of this message?",
    components: [row],
    ephemeral: true,
  });
};
