import {
    exec as unpromisedExec,
    spawn,
    fork,
    PromiseWithChild,
    ChildProcess,
    ChildProcessWithoutNullStreams
} from "child_process";
import { promisify } from "util";
import {readFile as orf, writeFile, writeFileSync} from "fs";
import { join } from "path";
import { generateKeyPair } from "crypto";
import {create} from "domain";

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
},async(err, publicKey,privateKey): Promise<boolean|Error> => {
    let pubKeyDescriptor: string = `pubKey.pem`;
    let privKeyDescriptor: string = `privKey.pem`;
    if (err == undefined) {
        await createFile(join(__dirname,pubKeyDescriptor));
        await createFile(join(__dirname,privKeyDescriptor));
        let validKeyFormat: boolean = !!publicKey && !!privateKey;
        if (validKeyFormat) {
            writeFileSync(pubKeyDescriptor,publicKey,'utf-8');
            writeFileSync(privKeyDescriptor,privateKey,'utf-8');
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
        console.log(`File ${fileName} created.
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
    console.log(stdout);
    console.log(stderr);
};





