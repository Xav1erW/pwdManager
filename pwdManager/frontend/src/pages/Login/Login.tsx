import React, { useState, useEffect, useRef } from 'react'
import axios, { AxiosResponse } from 'axios'
import Dropdown from './Dropdown';
import styles from './styles/Login.module.scss';

export default function Login(props: any): JSX.Element {
    const fetcher = axios.create({
        baseURL: "http://127.0.0.1:4523/mock/862776/",
        timeout: 1000
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
            const password = passwordInput.current?.value
            fetcher.post(
                `/api/verify?uuid=${selected}`,
                {
                    data: {
                        password
                    }
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
