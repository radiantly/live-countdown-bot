import { readFile } from "fs";
import { join } from "path";

// This a delightful example of a mini callback-hell
export const getGitInfo = () => {
  // Need to go old-fashioned, because the fs module still does not support promises
  return new Promise((resolve, reject) => {
    // Try reading HEAD
    readFile(".git/HEAD", "ascii", (err, head) => {
      // If error, just reject
      if (err) return reject(new Error("Cannot read .git/HEAD"));

      // Assuming HEAD is a hash, read first 7 characters
      const headHash = head.substr(0, 7);

      // If not detached, HEAD probably points to a branch. Try parsing that.
      const ref = /^ref: (.+)/.exec(head);

      // If unable to parse, just return the supposed the HEAD hash
      if (ref?.length !== 2) return resolve(headHash);

      // Try reading ref to get hash
      readFile(join(".git", ref[1]), "ascii", (err, refHash) => {
        // If error, just reject
        if (err) return reject(new Error(`Error reading ${ref[1]}`));

        // Else jackpot!
        resolve(`${ref[1].replace(/.*\//, "")}@${refHash.substr(0, 7)}`);
      });
    });
  });
};
