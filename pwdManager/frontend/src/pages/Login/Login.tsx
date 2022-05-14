import React, { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import Dropdown from './Dropdown';
import { AuthContext, authContextType } from 'src/App';
import api from 'src/utils/api';
import styles from './styles/Login.module.scss';


export default function Login(props: any): JSX.Element {
    const authContext: authContextType = useContext(AuthContext)
    const [files, setFiles] = useState([])
    const [selected, setSelected] = useState("")
    const passwordInput = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    useEffect((): void => {
        const getData = async () => {
            const data = await api.getFileList()
            return data
        }
        getData().then((data: any) => {
            setFiles(data.data)
        })
    }, [])

    useEffect((): void => {
        console.log(selected)
    }, [selected])

    const decript = (): void => {
        if (selected !== "") {
            const password = (passwordInput.current as HTMLInputElement).value as string
            // const data = encrypt(password, authContext.privateKey)
            
            api.Login(selected, password).then((data: any) => { if (data.status === 'success'){
                const { uuid, name } = data
                authContext.setDbInfo({ dbUUID: uuid, dbName: name })
                navigate('/home')
            } })
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
