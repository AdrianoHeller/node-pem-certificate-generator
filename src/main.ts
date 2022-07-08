import {
    exec as unpromisedExec,
    spawn,
    fork,
    PromiseWithChild,
    ChildProcess,
    ChildProcessWithoutNullStreams
} from "child_process";
import { promisify } from "util";
import { readFile as orf, writeFile } from "fs";
import { join } from "path";
import { generateKeyPair } from "crypto";

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
},(err, publicKey,privateKey) => {
    if (err == undefined) {
        const data = {
            publicKey,
            privateKey
        };
        return data;
    } else {
        console.log(err as any);
        return(err as any)
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
    if (createFile.exitCode === 0) {
        console.log(`File ${fileName} created.`);
        return true;
    } else {
        return false;
    }
};

const execCommand = async(commandArray: string) => {
    const { stdout, stderr } = await exec(commandArray);
    console.log(stdout);
    console.log(stderr);
};




