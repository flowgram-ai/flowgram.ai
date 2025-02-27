import path from 'path';

import { execSync } from 'child_process';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import { Command } from 'commander';
import chalk from 'chalk';
import download from 'download';
import * as tar from 'tar';

const program = new Command();

const args = process.argv.slice(2);

program
  .version('1.0.0')
  .description('Create a demo project')
  .action(async () => {
    console.log(chalk.green('Welcome to @flowgram.ai/create-app CLI!'));
    const latest = execSync('npm view @flowgram.ai/demo-fixed-layout version --tag=latest latest').toString().trim();

    let folderName = ''

    if (!args?.length) {
      // 询问用户选择 demo 项目
      const { repo } = await inquirer.prompt([
        {
          type: 'list',
          name: 'repo',
          message: 'Select a demo to create:',
          choices: [
            { name: 'Fixed Layout Demo', value: 'demo-fixed-layout' },
            { name: 'Free Layout Demo', value: 'demo-free-layout' },
            { name: 'Fixed Layout Demo Simple', value: 'demo-fixed-layout-simple' },
            { name: 'Free Layout Demo Simple', value: 'demo-free-layout-simple' }
          ],
        },
      ]);

      folderName = repo; 
    } else {
      if (['demo-fixed-layout', 'demo-free-layout', 'demo-fixed-layout-simple', 'demo-free-layout-simple'].includes(args[0])) {
        folderName = args[0];
      } else {
        console.error('Invalid argument. Please run "npx create-app" to choose demo.');
        return;
      }
    }

    try {
      const targetDir = path.join(process.cwd());
      // 下载 npm 包的 tarball
      const downloadPackage = async () => {
        try {
          // 从 npm registry 下载 tarball 文件
          const tarballBuffer = await download(`https://registry.npmjs.org/@flowgram.ai/${folderName}/-/${folderName}-${latest}.tgz`);

          // 确保目标文件夹存在
          fs.ensureDirSync(targetDir);
          
          // 创建一个临时文件名来保存 tarball 数据
          const tempTarballPath = path.join(process.cwd(), `${folderName}.tgz`);
          
          // 将下载的 tarball 写入临时文件
          fs.writeFileSync(tempTarballPath, tarballBuffer);

          // 解压 tarball 文件到目标文件夹
          await tar.x({
            file: tempTarballPath,
            C: targetDir,
          });

          fs.renameSync(path.join(targetDir, 'package'), path.join(targetDir, folderName))

          // 删除下载的 tarball 文件
          fs.unlinkSync(tempTarballPath);
          return true;

        } catch (error) {
          console.error(`Error downloading or extracting package: ${error}`);
          return false;
        }
      };
      const res = await downloadPackage();
      if (res) {
        // 克隆项目
        console.log(chalk.green(`${folderName} Demo project created successfully!`));

        console.log(chalk.yellow('Run the following commands to start:'));
        console.log(chalk.cyan(`  cd ${folderName}`));
        console.log(chalk.cyan('  npm install'));
        console.log(chalk.cyan('  npm start'));
      } else {
        console.log(chalk.red('Download failed'))
      }

    } catch (error) {
      console.error('Error downloading repo:', error);
      return;
    }
  });

program.parse(process.argv);
