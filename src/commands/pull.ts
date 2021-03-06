import ora = require('ora');
import * as prettyjson from 'prettyjson';
import { Visualization } from '../@types/zoomdata';
import { visualizations } from '../requests';
import { getPkgBuffer } from '../requests/visualizations';
import { unzipFile, writeFile } from '../utilities';
import { Config } from './config';

function pull(
  nameOrVis: string | Visualization,
  serverConfig: Config,
  dir?: string,
  zip?: boolean,
) {
  const directory = dir ? dir : process.cwd();
  if (typeof nameOrVis === 'object') {
    const pullSpinner = ora(`Pulling chart: ${nameOrVis.name}`).start();
    return getPackage(nameOrVis, serverConfig, directory, zip)
      .then(() => pullSpinner.succeed())
      .catch(error => {
        pullSpinner.fail();
        console.log(prettyjson.render(error));
        return Promise.reject(error);
      });
  }

  let spinner = ora(`Fetching chart: ${nameOrVis}`).start();
  return visualizations
    .getByName(nameOrVis, serverConfig)
    .then(visualization => {
      spinner.succeed();
      spinner = ora(`Pulling chart: ${nameOrVis}`).start();
      return getPackage(visualization, serverConfig, directory, zip)
        .then(() => spinner.succeed())
        .catch(error => {
          spinner.fail();
          return Promise.reject(error);
        });
    })
    .catch(error => {
      spinner.fail();
      console.log(prettyjson.render(error));
      return Promise.reject(error);
    });
}

function getPackage(
  visualization: Visualization,
  serverConfig: Config,
  dir: string,
  zip?: boolean,
) {
  const visName = visualization.name.toLowerCase().replace(/ /g, '_');
  return getPkgBuffer(visualization.id, serverConfig)
    .then(buffer => writeFile(dir, `${visName}.zip`, buffer))
    .then(
      () =>
        zip
          ? Promise.resolve(undefined)
          : unzipFile(`${dir}/${visName}.zip`, `${dir}/${visName}`, true),
    );
}

export { pull };
