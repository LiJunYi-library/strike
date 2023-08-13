#!/usr/bin/env node

const minimist = require("minimist");
const path = require("path");
const fs = require("node:fs/promises");
const { access, constants, readdir, cp } = fs;
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

const commands = ["server", "build"];
const command = args[0];

if (!commands.includes(command)) {
  console.error("暂不支持这个命令");
  process.exit(1)
}

const server = new Service();

server[command](arguments);
// console.log(path.resolve(""));
// console.log(__dirname);

// readdir(path.resolve("./htmls")).then((files) => {
//   console.log(files);
// });

//
// debugger;
