import React, { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import Dropdown from './Dropdown';
import { AuthContext, authContextType, ThemeContext } from 'src/App';
import api from 'src/utils/api';
import styles from './styles/Login.module.scss';
import classNames from 'classnames/bind';


export default function Login(props: any): JSX.Element {
    const authContext: authContextType = useContext(AuthContext)
    const themeContext = useContext(ThemeContext)
    const [files, setFiles] = useState([])
    const [selected, setSelected] = useState("")
    const passwordInput = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()
    console.log(api)
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

    const MyClassName = classNames.bind(styles)

    const loginPage = MyClassName({
        loginPage: true,
        dark: themeContext.theme === 'dark'
    })

    const file = MyClassName({
        file: true,
        dark: themeContext.theme === 'dark'
    })

    const masterPassword = MyClassName({
        masterPassword: true,
        dark: themeContext.theme === 'dark'
    })

    return (
        <div className={loginPage}>
            <div className={styles.loginForm}>
                <div className={file}>
                    <span>File</span>
                    <Dropdown files={files} onSelect={setSelected} />
                </div>
                <div className={masterPassword}>
                    <span>Password</span>
                    <input type="password" className={styles.passwordInput} ref={passwordInput} />
                </div>
                {/* <span className={styles.loginBtn} onClick={decript}>解密文件</span> */}
                <span className={styles.otherMethod}>其他解锁方式？</span>
                <span className={styles.loginBtn} onClick={decript}>ENTER</span>
            </div>
            <span className={styles.changeTheme} onClick={()=>{themeContext.toggleTheme()}}>{themeContext.theme === 'light'?"🌙":"\u2600"}</span>
        </div>
    )
}
