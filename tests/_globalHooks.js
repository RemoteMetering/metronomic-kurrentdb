import { spawn } from 'child_process';
import { fileURLToPath } from 'node:url';
import path from 'path';
import sleep from './utilities/sleep.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const securityMode = process.env.TESTS_RUN_SECURE === 'true' ? 'secure' : 'insecure';

console.log(`Running tests in \x1b[36m${securityMode}\x1b[0m mode...`);

const singleComposeFileLocation = path.join(__dirname, 'support', 'single', `docker-compose-${securityMode}.yml`);
const clusterComposeFileLocation = path.join(__dirname, 'support', 'cluster', `docker-compose-${securityMode}.yml`);
let kurrentdb;

const startStack = async (filePath) =>
  new Promise((resolve, reject) => {
    const proc = spawn('docker-compose', ['--file', filePath, 'up', '-d'], {
      cwd: undefined,
      stdio: ['ignore', 'ignore', process.stderr]
    });

    proc.on('close', (code) => (code === 0 ? resolve() : reject(code)));
  });

const removeStack = async (filePath) =>
  new Promise((resolve, reject) => {
    const proc = spawn('docker-compose', ['--file', filePath, 'down', '--remove-orphans'], {
      cwd: undefined,
      stdio: ['ignore', 'ignore', process.stderr]
    });

    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject();
    });
  });

const isContainerReady = async (containerName, readyOutputMatch) =>
  new Promise((resolve) => {
    const proc = spawn('docker', ['logs', containerName], {
      cwd: undefined
    });
    proc.stdout.on('data', (line) => line.toString().includes(readyOutputMatch) && resolve(true));
    proc.on('close', () => resolve(false));
  });

export async function globalSetup() {
  if (kurrentdb) return;

  console.log('Starting KurrentDB stacks...');

  await Promise.all([removeStack(singleComposeFileLocation), removeStack(clusterComposeFileLocation)]);
  await Promise.all([startStack(singleComposeFileLocation), startStack(clusterComposeFileLocation)]);

  while (true) {
    const [isSingleReady, isClusterReady] = await Promise.all([
      isContainerReady('kurrentdb_test_single', `System startup tasks completed`),
      isContainerReady('kurrentdb_test_cluster_node1', 'System startup tasks completed')
    ]);
    if (isSingleReady && isClusterReady) break;
    await sleep(100);
  }
  await sleep(1000);
}

export async function globalTeardown() {
  console.log('Killing KurrentDB stacks...');
  await Promise.all([removeStack(singleComposeFileLocation), removeStack(clusterComposeFileLocation)]);
}

export const runningTestsInSecureMode = process.env.TESTS_RUN_SECURE === 'true';