import * as inquirer from 'inquirer';
import { Config } from '../commands/config';
import { Visualization } from '../common';
import { visualizations } from '../requests';
import ora = require('ora');

const questions: inquirer.Questions = [
  {
    message: 'Please enter a new name for the chart:',
    name: 'name',
    type: 'input',
  },
];

function answerHandler(
  answers: inquirer.Answers,
  visualization: Visualization,
  serverConfig: Config,
) {
  visualization.name = answers.name;
  const spinner = ora(`Updating name for: ${visualization.name}`).start();
  return visualizations
    .update(visualization.id, JSON.stringify(visualization), serverConfig)
    .then(() => spinner.succeed())
    .catch(error => {
      spinner.fail();
      return Promise.reject(error);
    });
}

function prompt(visualization: Visualization, serverConfig: Config) {
  return inquirer
    .prompt(questions)
    .then(answers => answerHandler(answers, visualization, serverConfig));
}

export { prompt };