import axios, { AxiosInstance, AxiosResponse } from "axios";

import { encrypt, decrypt } from "./rsa";

interface CollectionResponse {
    collectionList: {
        name: string,
        uuid: string
    }[],
    dbName: string
}

interface pwdListResponse {
    passwordList: {
        name: string,
        uuid: string
    }[],
}

interface pwdResponse {
    title: string,
    username: string,
    password: string,
    url: string,
    description: string
}

interface pwdDetailsResponse {
    title: string,
    username: string,
    password: string,
    url: string,
    description: string,

    updateDate: string,
    createTime: number, // timestamp
    updateTime: number, // timestamp
    updateHistory: string[],
    autoComplete: Boolean,
    matchRules: string[], //url list

}

export class Api {
    authToken: string = "";
    baseUrl: string = "/api/";
    client: AxiosInstance;
    private privateKey: string = ""
    private serverPublicKey: string = ""
    constructor(baseUrl?: string) {
        this.client = axios.create({
            baseURL: baseUrl ? baseUrl : this.baseUrl,
            headers: {
                'Authorization': this.authToken
            }
        })
    }

    async get(url: string): Promise<any> {
        const response = await this.client.get(url)
        if (response.status === 200) {
            return response
        } else if (response.status === 401) {
            throw new Error("Unauthorized")
        }
    }

    async post(url: string, data: any): Promise<any> {
        const response = await this.client.post(url, data)
        if (response.status === 200) {
            return response
        } else {
            throw new Error(response.data['msg'])
        }
    }

    async BeforeLogin(uuid: string, pubKey: string): Promise<any> {
        const response = await this.post('auth', {
            'session id': uuid,
            'public key': pubKey
        })
        const jwt = response.data['jwt']
        const publicKey = response.data["public key"]
        this.setServerPublicKey(publicKey)
        return { jwt, publicKey }
    }

    async getFileList(): Promise<any> {
        const response = await this.get('fileList')
        return response.data
    }

    async Login(dbUUID: string, password: string): Promise<any> {
        console.log('password', password)
        console.log('key', this.serverPublicKey)
        const encryptedPassword = encrypt(password, this.serverPublicKey)
        const response = await this.post(`verify?uuid=${dbUUID}`, { password: encryptedPassword })
        if (response.status === 200) {
            this.authToken = response.data['jwt']
            // 添加dbUUID到header中作为参数
            this.client.defaults.headers.common['dbUUID'] = dbUUID
            return response.data
        } else {
            throw new Error(response.data['msg'])
        }
    }


    async getCollectionList(): Promise<CollectionResponse> {
        const response = await this.get('collection/list')
        if (response.status === 200) {
            const data: CollectionResponse = { collectionList: response.data.data, dbName: response.data.dbName }
            return data
        }
        else {
            throw new Error(response.status)
        }
    }

    async getPasswordList(collectionUUID: string): Promise<pwdListResponse> {
        const response = await this.get(`collection/info?collectionID=${collectionUUID}`)
        if (response.status === 200) {
            const data: pwdListResponse = { passwordList: response.data.data }
            return data
        }
        else {
            throw new Error(response.status)
        }
    }

    async getPasswordInfo(passwordUUID: string, detail: Boolean = false): Promise<pwdResponse | pwdDetailsResponse> {
        const response = await this.get(`pwd/info?uuid=${passwordUUID}&detail=${detail}`)
        if (detail) {
            if (response.status === 200) {
                const username = decrypt(response.data.username, this.privateKey)
                const password = decrypt(response.data.password, this.privateKey)
                const updateHistory = response.data.updateHistory.map((item:string) => decrypt(item, this.privateKey))
                const data: pwdDetailsResponse = {
                    title: response.data.title,
                    username: username,
                    password: password,
                    url: response.data.url,
                    description: response.data.description,
                    updateDate: response.data.updateDate,
                    createTime: response.data.createTime,
                    updateTime: response.data.updateTime,
                    updateHistory: updateHistory,
                    autoComplete: response.data.autoComplete,
                    matchRules: response.data.matchRules,
                }
                return data
            }
            else{
                throw new Error(response.status)
            }
        } else {
            if (response.status === 200) {
                const username = decrypt(response.data.username, this.privateKey)
                const password = decrypt(response.data.password, this.privateKey)
                const data: pwdResponse = {
                    title: response.data.title,
                    username: username,
                    password: password,
                    url: response.data.url,
                    description: response.data.description
                }
                return data
            }
            else {
                throw new Error(response.status)
            }
        }
    }

    setPrivateKey(privateKey: string) {
        this.privateKey = privateKey
    }
    setServerPublicKey(serverPublicKey: string) {
        this.serverPublicKey = serverPublicKey
    }
}

// mock api
export default new Api('http://127.0.0.1:4523/mock/862776/api/')