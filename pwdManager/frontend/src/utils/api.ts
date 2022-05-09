import axios, { AxiosInstance, AxiosResponse } from "axios";

export class Api {
    authToken: string = "";
    baseUrl: string = "/api/";
    client: AxiosInstance;
    constructor(baseUrl?: string) {
        this.client = axios.create({
            baseURL: baseUrl?baseUrl:this.baseUrl,
            headers: {
                'Authorization': this.authToken
            }
        })
    }

    async get(url: string):Promise<any> {
        const response = await this.client.get(url)
        if (response.status === 200) {
            return response
        } else if(response.status === 401) {
            throw new Error("Unauthorized")
        }
    }

    async post(url: string, data: any):Promise<any> {
        const response = await this.client.post(url, data)
        if (response.status === 200) {
            return response
        } else {
            throw new Error(response.data['msg'])
        }
    }

    async BeforeLogin(uuid: string, pubKey: string):Promise<any> {
        const response = await this.post('auth', {
            'session id': uuid,
            'public key': pubKey
        })
        const jwt = response.data['jwt']
        const publicKey = response.data["public key"]
        return {jwt, publicKey}
    }

    async getFileList():Promise<any> {
        const response = await this.get('fileList')
        return response.data
    }

    async Login(dbUUID: string, password: string):Promise<any> {
        const response = await this.post(`verify?uuid=${dbUUID}`, {password})
        return response.data
    }
}

// mock api
export default new Api('http://127.0.0.1:4523/mock/862776/api/')