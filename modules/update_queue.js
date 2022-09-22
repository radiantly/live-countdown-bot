import FlatQueue from "flatqueue";
import { deleteCountdown, getAllCountdowns, insertCountdown } from "./reloadable/sqlite3.js";

class UpdateQueue {
  constructor() {
    this.queue = new FlatQueue();
  }

  load(runId) {
    for (const row of getAllCountdowns(runId)) {
      this.queue.push(row, row.updateTime);
      console.log(row);
    }
  }

  insert({ guildId, channelId, authorId, updateTime, data }) {
    const obj = insertCountdown(guildId, channelId, authorId, updateTime, data);
    this.queue.push(obj, updateTime);
  }

  next() {
    if (!this.queue.length) return null;
    const { updateTime, rowid } = this.queue.peek();
    if (updateTime < Date.now()) {
      deleteCountdown(rowid);
      return this.queue.pop();
    }
    return null;
  }
}

export const updateQueue = new UpdateQueue();
