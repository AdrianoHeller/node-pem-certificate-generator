import {
    exec as unpromisedExec,
    spawn,
    fork,
    PromiseWithChild,
    ChildProcess,
    ChildProcessWithoutNullStreams
} from "child_process";
import { promisify } from "util";
import {readFile as orf, writeFileSync} from "fs";
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
},async(err, publicKey,privateKey): Promise<boolean|Error> => {
    let pubKeyDescriptor: string = `pubKey.pem`;

    let privKeyDescriptor: string = `privKey.pem`;

    if (err == undefined) {
        let createPk: boolean = await createFile(join(__dirname,pubKeyDescriptor));

        let createPvk: boolean = await createFile(join(__dirname,privKeyDescriptor));

        await Promise.all([createPk,createPvk]);

        let validKeyFormat: boolean = !!publicKey && !!privateKey;

        if (validKeyFormat) {
            let writePkContent: void = writeFileSync(pubKeyDescriptor,publicKey,'utf-8');

            let writePvkContent: void = writeFileSync(privKeyDescriptor,privateKey,'utf-8');

            await Promise.all([writePkContent,writePvkContent]);

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





