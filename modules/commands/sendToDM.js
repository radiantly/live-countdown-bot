export const command = {
  type: 3,
  name: "Send To DM",
};

export const handler = async interaction => {
  await interaction.deferReply({ ephemeral: true });
  const messages = interaction.options.resolved.messages;
  if (!messages)
    interaction.reply({
      content: "Error retrieving message",
      ephemeral: true,
    });

  try {
    const channel = await interaction.user.createDM();
    for (const message of [...messages.values()]) {
      const content = message.content || undefined;
      const embeds = message.embeds;
      const files = [...message.attachments.values()];
      if (!content && !embeds && !files)
        return await interaction.editReply({
          content: "Error: Cannot send an empty message.",
          ephemeral: true,
        });
      await channel.send({ content, embeds, files });
    }
    await interaction.editReply({
      content: "Successfully sent to DM.",
      ephemeral: true,
    });
  } catch (ex) {
    console.log(ex);
    interaction.editReply({
      content: "Error: cannot send to DM.",
      ephemeral: true,
    });
  }
};
