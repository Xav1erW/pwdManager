import axios, { AxiosInstance, AxiosResponse } from "axios";

import { encrypt, decrypt, generateKeys } from "./rsa";

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

interface pwdSearchResponse{
    pwdID:string,
    name:string,
    colID:string,
}

interface pwdUpdateRequest extends pwdResponse {}
interface pwdUpdateRequestDetail extends pwdDetailsResponse {}
interface pwdUpdateResponse {
    status: string,
    data: pwdDetailsResponse
}

interface newDBInfo {
    name: string,
    uuid: string
}
interface newCollectionInfo{
    status:string,
    data:newDBInfo[]
}

const keys = generateKeys();
const MyPublicKey = keys.publicKey;
const MyPrivateKey = keys.privateKey;

export class Api {
    authToken: string = "";
    baseUrl: string = "/api/";
    client: AxiosInstance;
    private privateKey: string = MyPrivateKey
    private serverPublicKey: string = ""
    constructor(baseUrl?: string) {
        this.client = axios.create({
            baseURL: baseUrl ? baseUrl : this.baseUrl,
            headers: {
                // 'Authentication': this.authToken,
                // "Access-Control-Allow-Origin": "*",
                // "Access-Control-Allow-Credentials": true,
            },
            withCredentials: true
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

    async BeforeLogin(uuid: string): Promise<any> {
        const response = await this.post('auth', {
            'sessionID': uuid,
            'publicKey': MyPublicKey
        })
        const jwt = response.data['jwt']
        const publicKey = response.data["public_key"]
        sessionStorage.setItem('jwt', jwt)
        sessionStorage.setItem('publicKey', publicKey)
        this.client.defaults.headers.common['Authentication'] = jwt
        this.authToken = jwt
        console.log('jwt', this.client.defaults.headers.common['Authentication'])
        console.log('publicKey', publicKey)
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
        // console.log('auth', this.client.defaults.headers.common['Authentication'])
        const response = await this.client.post(`verify?uuid=${dbUUID}`, { password: encryptedPassword }, {
            headers: {
                // 'Authentication': this.authToken
            }
        })
        if (response.status === 200) {
            this.authToken = response.data['jwt']
            // 添加dbUUID到header中作为参数
            this.client.defaults.headers.common['dbUUID'] = dbUUID
            return response.data
        } else {
            alert(response.data['msg'])
            throw new Error(response.data['msg'])
        }
    }


    async getCollectionList(): Promise<CollectionResponse> {
        const response = await this.get('collection/list')
        if (response.status === 200) {
            const data: CollectionResponse = { collectionList: response.data.data, dbName: response.data.dbname }
            return data
        }
        else {
            throw new Error(response.status)
        }
    }

    async getPasswordList(collectionUUID: string): Promise<pwdListResponse> {
        const response = await this.get(`collection/info?collectionID=${collectionUUID}`)
        if (response.status === 200) {
            console.log('response', response.data)
            const data: pwdListResponse = { passwordList: response.data.data }
            return data
        }
        else {
            throw new Error(response.status)
        }
    }

    async getPasswordInfo(passwordUUID: string, collectionID:string, detail: Boolean = false): Promise<pwdResponse | pwdDetailsResponse> {
        const response = await this.get(`pwd/info?pwdUUID=${passwordUUID}&detail=${detail}&collectionUUID=${collectionID}`)
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

    async savePassword(password: pwdUpdateRequest|pwdUpdateRequestDetail, colUUID:string, pwdID:string): Promise<any> {
        const encryptedPassword = encrypt(password.password, this.serverPublicKey)
        const encryptedUsername = encrypt(password.username, this.serverPublicKey)
        const response = await this.client.post(`pwd/update?pwdID=${pwdID}&collectionID=${colUUID}`, {...password, username: encryptedUsername, password: encryptedPassword})
        if (response.status === 200) {
            return response.data
        }
        else {
            throw new Error(response.status.toString())
        }
    }

    async createPassword(password: pwdUpdateRequest, colUUID:string): Promise<pwdUpdateResponse> {
        const encryptedPassword = encrypt(password.password, this.serverPublicKey)
        const encryptedUsername = encrypt(password.username, this.serverPublicKey)
        const response = await this.client.post(`pwd/create?uuid=${colUUID}`, {...password, username: encryptedUsername, password: encryptedPassword})
        if (response.status === 200) {
            console.log(response.data)
            const username = decrypt(response.data.data.username, this.privateKey)
            const password = decrypt(response.data.data.password, this.privateKey)
            return {...response.data.data, username, password}
        }
        else {
            throw new Error(response.status.toString())
        }
    }

    async deletePassword(passwordUUID: string, collectionID:string): Promise<any> {
        const response = await this.client.get(`pwd/del?pwdID=${passwordUUID}&colID=${collectionID}`)
        if (response.status === 200) {
            return response.data
        }
        else {
            throw new Error(response.status.toString())
        }
    }

    async deleteCollection(collectionUUID: string): Promise<any> {
        const response = await this.client.get(`collection/delete?colID=${collectionUUID}`)
        if (response.status === 200) {
            return response.data
        }
        else {
            throw new Error(response.status.toString())
        }
    }

    async searchPassword(keyword: string): Promise<pwdSearchResponse[]> {
        const response = await this.client.get(`search?name=${keyword}`)
        if (response.status === 200) {
            return response.data
        }
        else {
            throw new Error(response.status.toString())
        }
    }

    async createNewDB(dbName: string, password: string): Promise<newDBInfo> {
        const encryptedPassword = encrypt(password, this.serverPublicKey)
        const response = await this.client.post(`database/create`, { name:dbName, password: encryptedPassword })
        if (response.status === 200) {
            return response.data.data
        }
        else {
            throw new Error(response.status.toString())
        }
    }

    async createNewCollection(collectionName: string): Promise<newCollectionInfo> {
        const response = await this.client.post(`collection/create`, { name: collectionName })
        if (response.status === 200) {
            return response.data.data
        }
        else {
            throw new Error(response.status.toString())
        }
    }

    async updateCollection(collectionUUID: string, collectionName: string): Promise<any> {
        const response = await this.client.post(`collection/update`, { collectionID: collectionUUID, name: collectionName })
        if (response.status === 200) {
            return response.data
        }
        else {
            throw new Error(response.status.toString())
        }
    }

    setPrivateKey(privateKey: string) {
        this.privateKey = privateKey
    }
    setServerPublicKey(serverPublicKey: string) {
        this.serverPublicKey = serverPublicKey
    }
    noAuthSolution() {
        if(sessionStorage.getItem('jwt') !== null){
            this.authToken = sessionStorage.getItem('jwt') as string
            this.client.defaults.headers.common['Authentication'] = this.authToken
            this.setServerPublicKey(sessionStorage.getItem('publicKey') as string)
            return
        }
    }
}

// mock api
// export default new Api('http://127.0.0.1:4523/mock/862776/api/')
export default new Api()