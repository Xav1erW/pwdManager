// module that contains the RSA encryption and decryption functions
// support for long string encryption and decryption
import JSEncrypt from "jsencrypt";


export function encrypt(text: string, publicKey: string): string {
    // encrypt the text
    let encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    let encrypted:string = encrypt.encrypt(text) as string;
    return encrypted;
}

export function decrypt(text: string, privateKey: string): string {
    // decrypt the text
    let decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey);
    let decrypted:string = decrypt.decrypt(text) as string;
    return decrypted;
}

export function generateKeys(length: string='1024'): {publicKey: string, privateKey: string} {
    // generate a pair of keys
    let keys = {
        publicKey: "",
        privateKey: ""
    };
    let rsa = new JSEncrypt({default_key_size: length});
    keys.publicKey = rsa.getPublicKey();
    keys.privateKey = rsa.getPrivateKey();
    return keys;
}