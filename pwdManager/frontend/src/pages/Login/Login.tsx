import React, { useState, useEffect, useRef, useContext } from 'react'
import axios, { AxiosResponse } from 'axios'
import { encrypt } from 'src/utils/rsa'
import Dropdown from './Dropdown';
import { AuthContext } from 'src/App';
import styles from './styles/Login.module.scss';

interface Auth {
    jwt: string
    publicKey: string
}

interface authContextType {
    uuid: string
    privateKey: string
    auth: Auth
}

export default function Login(props: any): JSX.Element {
    const authContext: authContextType = useContext(AuthContext)
    const { jwt } = authContext.auth
    const fetcher = axios.create({
        baseURL: "http://127.0.0.1:4523/mock/862776/",
        timeout: 1000,
        headers: {
            Authentication: jwt
        }
    })
    const [files, setFiles] = useState([])
    const [selected, setSelected] = useState("")
    const passwordInput = useRef<HTMLInputElement>(null)
    useEffect((): void => {
        fetcher.get('/api/fileList').then((response: AxiosResponse): void => {
            setFiles(response.data.data)
        }).catch((error: any): void => {
            console.log(error)
        })
    }, [])

    useEffect((): void => {
        console.log(selected)
    }, [selected])

    const decript = (): void => {
        if (selected !== "") {
            const password = (passwordInput.current as HTMLInputElement).value as string
            const data = encrypt(password, authContext.privateKey)
            fetcher.post(
                `/api/verify?uuid=${selected}`, {
                password: data
            }).then((response: AxiosResponse): void => {
                console.log(response.data)
            }).catch((error: any): void => {
                console.log(error)
            })
        }
    }

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginForm}>
                <div className={styles.file}>
                    <span>密码文件</span>
                    <Dropdown files={files} onSelect={setSelected} />
                </div>
                <div className={styles.masterPassword}>
                    <span>主密码</span>
                    <input type="password" className={styles.passwordInput} ref={passwordInput} />
                </div>
                <span className={styles.loginBtn} onClick={decript}>解密文件</span>
            </div>
        </div>
    )
}
