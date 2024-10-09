#!/usr/bin/env node

"use strict";

const { execSync } = require("child_process");
const path = require("path");
const chalk = require("chalk");
const fs = require("fs");
const readline = require("readline");

if (process.argv.length < 3) {
  console.log(chalk.red("You have to provide a name to your app."));
  console.log("For example :");
  console.log(chalk.green("    npx create-my-boilerplate my-app"));
  process.exit(1);
}

const projectName = process.argv[2];
const currentPath = process.cwd();
const projectPath =
  projectName === "." || projectName === "./"
    ? currentPath
    : path.join(currentPath, projectName);

// 사용자 입력을 받기 위한 readline 인터페이스 설정
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  try {
    if (projectName === "." || projectName === "./") {
      console.log(chalk.blue("Creating project in the current directory..."));
    } else if (fs.existsSync(projectPath)) {
      console.log(
        chalk.red(
          `The directory ${projectName} already exists. Please give it another name.`
        )
      );
      process.exit(1);
    }

    // 사용자에게 Git repository URL 입력받기
    const gitRepo = await askQuestion("git repository: ");
    rl.close(); // readline 종료

    console.log(chalk.blue("Downloading files..."));
    execSync(`git clone --depth 1 ${gitRepo} ${projectPath}`);

    if (projectName !== "." && projectName !== "./") {
      process.chdir(projectPath);
    }

    console.log(chalk.blue("Installing dependencies..."));
    execSync("npm install", { stdio: "inherit" });

    console.log(chalk.blue("Removing useless files..."));
    execSync("npx rimraf ./.git");

    console.log(chalk.blue("Initializing new git repository..."));
    execSync("git init", { stdio: "inherit" });

    console.log(chalk.blue("Adding remote repository..."));
    execSync(`git remote add origin ${gitRepo}`, { stdio: "inherit" });

    console.log(
      chalk.cyan(
        `cher1sh-react-app ${projectName} has been created successfully.`
      )
    );
  } catch (error) {
    console.log(chalk.red(error));
  }
}

main();
