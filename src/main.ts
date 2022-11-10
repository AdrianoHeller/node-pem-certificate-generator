import {
    exec as unpromisedExec,
    spawn,
    ChildProcessWithoutNullStreams
} from "child_process";
import { promisify } from "util";
import {readFile as orf, writeFile} from "fs";
import { join } from "path";
import { generateKeyPair } from "crypto";
import {createLogger, format, transports} from "winston";

const logger = createLogger({
    level:process.env.LOG_LEVEL,
    format: format.json(),
    defaultMeta: {
        service: process.env.SERVICE_NAME,
    },
    transports: [
        new transports.File({filename:process.env.ERROR_LOG_FILE,level: process.env.ERROR_LOG_LEVEL}),
        new transports.File({filename:process.env.COMBINED_LOG_FILE}),
    ],
});

if (process.env.NODE_ENV != `production`) {
    logger.add(new transports.Console({
        format: format.simple(),
    }))
}

generateKeyPair(`rsa`,{
    modulusLength: 4096,
    publicKeyEncoding: {
        type: `spki`,
        format: `pem`
    },
    privateKeyEncoding: {
        type: `pkcs8`,
        format: `pem`,
        cipher: `aes-256-cbc`,
        passphrase: `s3cr3t`
    }
},async(err: Error | null, publicKey: string,privateKey: string): Promise<boolean|Error> => {
    let pubKeyDescriptor: string = `pubKey.pem`;

    let privKeyDescriptor: string = `privKey.pem`;

    if (err == undefined) {
        let createPk: boolean = await createFile(join(__dirname,pubKeyDescriptor));

        let createPvk: boolean = await createFile(join(__dirname,privKeyDescriptor));

        await Promise.all([createPk,createPvk]);

        let validKeyFormat: boolean = !!publicKey && !!privateKey;

        if (validKeyFormat) {
            await writeFile(pubKeyDescriptor,publicKey,() => logger.info(`PUB written`));

            await writeFile(privKeyDescriptor,privateKey,() => logger.info(`PK written`));

            return true;
        } else {
            return false;
        }
    } else {
        return(err as any);
    }
});

const reverseBase64 = (x: string) => Buffer.from(x,"base64");

const exec: (...args: any) => Promise<any> = promisify(unpromisedExec);

const readFile: (...args: any) => Promise<any> = promisify(orf);

const getFileContents = async(fileName: string) => {
    let fileBuffer: Buffer = await readFile(join(__dirname,fileName));
    return fileBuffer.toString();
};

const createFile = async(fileName: string): Promise<boolean> => {
    let createFile: ChildProcessWithoutNullStreams = spawn(`touch`,[fileName]);
    if(createFile?.exitCode === null) {
        logger.info(`File ${fileName} created.
        Metadata:{
            exit: ${createFile.exitCode},  
            pid: ${createFile.pid}
        }`);
        return true;
    } else {
        return false;
    }
};

const execCommand = async(commandArray: string) => {
    const { stdout, stderr } = await exec(commandArray);
    logger.info(stdout);
    logger.error(stderr);
};





