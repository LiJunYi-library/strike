#!/usr/bin/env node

const minimist = require("minimist");
const Service = require("../config/service");

const args = process.argv.slice(2);
const arguments = minimist(process.argv, {
  boolean: [
    "modern",
    "report",
    "report-json",
    "inline-vue",
    "watch",
    "open",
    "copy",
    "https",
    "verbose",
    "frame",
  ],
  string: ["mode"],
});

console.log("------------");

const commands = ["server", "build"];
const command = args[0];

if (!commands.includes(command)) {
  console.error("暂不支持这个命令");
  process.exit()
}

const server = new Service();

server[command](arguments);

