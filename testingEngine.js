import express from 'express';
import { randomBytes } from 'crypto';
import getPortSync from 'get-port-sync';

const testingPort = getPortSync();
export const testingUrl = `http://localhost:${testingPort}`;


/**
 * Get the caller of a function
 *
 * @see https://stackoverflow.com/questions/16697791/nodejs-get-filename-of-caller-function
 * @return {string|undefined} the filename or undefined if not possible
 */
function _getCallerFile() {
  try {
    const err = new Error();
    Error.prepareStackTrace = (_, stack) => stack;

    const currentfile = err.stack.shift().getFileName();

    while (err.stack.length) {
      const callerfile = err.stack.shift().getFileName();
      if (currentfile !== callerfile) {
        return callerfile
          .split('/')
          .pop()
          .replace('.spec.js', '');
      }
    }
  } catch (err) {
    return undefined;
  }
  return undefined;
}

export class Scenario {
  constructor(s) {
    this.suite = s;
  }

  play() {
    describe(`Scenario [${_getCallerFile()}]: ${this.suite.name}`, () => {
      let server;

      beforeAll(async () => {
        const app = express();
        const fileSize = 5000;
        const testFile = await new Promise((resolve, reject) => {
          randomBytes(fileSize, (err, buf) => {
            if (err) {
              reject(err);
            }
            resolve(buf);
          });
        });

        app.get('/1', (req, res) => {
          res.send(testFile);
        });

        app.get('/2', (req, res) => {
          res.send(testFile);
        });

        server = app.listen(testingPort);
      });

      this.suite.steps.forEach(step => {
        const { title, url } = step;
        test(`${title}`, () => {
          fetch(url)
            .then(res => res.blob())
            .then(res => res.size === 5000);
        });

        afterAll(() => {
          server.close();
        });
      });
    });
  }
}
