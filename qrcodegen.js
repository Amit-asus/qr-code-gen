import inquirer from "inquirer";
import qr from "qr-image";
import fs from "fs";
import fsPromises from "fs/promises"; //directry create kara ne k liye hai ye
import chalk from "chalk";
import validator from "validator";
import path from "path";


async function getURL() {
  try {
    let answer = await inquirer.prompt([
      { message: "Type in Your url", name: "url" },
    ]);
    return answer.url;
  } catch (err) {
    throw Error(`error in inputing ${err}`);
  }
}
async function getImageType() {
  try {
    let answer = await inquirer.prompt([
      {
        message: "Type in Your url",
        name: "imageType",
        type: "list",
        choices: ["png", "svg", "pdf"],
      },
    ]);
    return answer.imageType;
  } catch (err) {
    throw Error(`proglem in image type ${err}`);
  }
}
async function generateQrCode(url, imageType) {
  try {
    switch (imageType) {
      case "svg":
        imageType = { type: "svg" };
        break;

      case "png":
        imageType = { type: "png" };
        break;

      default:
        imageType = { type: "pdf" };
    }
    let imgName = "";
    let wwwIndex = url.indexOf("www");
    if (wwwIndex == -1) {
      let ddFwIndex = url.indexOf("//");
      if (ddFwIndex == -1) {
        ddFwIndex = 0;
      } else {
        ddFwIndex += 2;
      }
      imgName = url.substring(ddFwIndex,url.indexOf("."));
    } else {
      let secondDot = url.indexOf(".", wwwIndex + 4);
      imgName = url.substring(wwwIndex + 4, secondDot);
    }
    const dirPath = "./qrcodes";
    if(!fs.existsSync(dirPath))
    {
         await fsPromises.mkdir(dirPath);
    }
    let fileName = imgName + "_img" +"."+ imageType.type ;
    let filePath = path.join(dirPath,fileName);
    let wrStream = fs.createWriteStream(filePath);
    let qrCode = qr.image(url,imageType);
    qrCode.pipe(wrStream);
    return fileName ;
    
  } catch (err) {
    throw Error(`error in genrating ${err}`);
  }
}

async function writeToFile(filePath, url) {
    try
    {
        await fsPromises.appendFile(filePath,url);

    }
    catch(err)
    {
        throw Error(`error in appending utl to  the file ${err}`);

    }
}

async function doTask() {
    try
    {
        let url = await getURL();
        console.log(chalk.blue(`you typed ${url}`));
        let isValidUrl = validator.isURL(url);
        if(!isValidUrl)
        {
            throw Error(`Invalid url ${url}`);
        }
        console.log(chalk.green(`IT IS A VALID URL`));
        let imageType = await getImageType();
        console.log(chalk.blue(`you selected ${imageType}`));
        let fileName = await generateQrCode(url,imageType);
        if(fileName == '')
        {
           throw Error("could not  genrated the qr code");
        }
        console.log(chalk.green(`qr code genrated and saved in ${fileName}`));
        const filePath = "./qrcodes/URL.txt";
        writeToFile(filePath,url + "\n") ;
        console.log(chalk.green(`url saved in URL.txt`));
    }
    catch(err)
    {
        console.log(chalk.red(err.message));

    }
}

doTask();