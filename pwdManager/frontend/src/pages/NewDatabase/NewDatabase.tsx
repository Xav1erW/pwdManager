import React, { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext, authContextType, ThemeContext } from 'src/App';
import api from 'src/utils/api';
import styles from './styles/NewDatabase.module.scss';
import classNames from 'classnames/bind';


export default function NewDatabase(props: any): JSX.Element {
    const authContext: authContextType = useContext(AuthContext)
    const themeContext = useContext(ThemeContext)
    const [files, setFiles] = useState([])
    const [pwd, setPwd] = useState("")
    const [dbName, setDbName] = useState('')
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

    const newDB = () => {
        const legalPattern = /^[\u4e00-\u9fa5A-Za-z0-9]{1,}$/
        if (legalPattern.test(dbName)) {
            api.createNewDB(dbName, pwd).then((data: any) => {
                const { uuid, name } = data
                authContext.setDbInfo({ dbUUID: uuid, dbName: name })
                navigate('/home')
            })
        }
        else {
            alert('名称不合法')
        }
    }

    const updatePwd = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPwd(e.target.value)
    }

    const updateDbName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value
        setDbName(newName)
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
                    <span>DB Name</span>
                    <input type="text" className={styles.Input} onChange={updateDbName} />

                </div>
                <div className={masterPassword}>
                    <span>Password</span>
                    <input type="password" className={styles.Input} onChange={updatePwd} />
                </div>
                {/* <span className={styles.loginBtn} onClick={decript}>解密文件</span> */}
                <span className={styles.otherMethod}>其他解锁方式？</span>
                <span className={styles.loginBtn} onClick={newDB}>CREATE</span>
            </div>
            <span className={styles.changeTheme} onClick={() => { themeContext.toggleTheme() }}>{themeContext.theme === 'light' ? "🌙" : "\u2600"}</span>
        </div>
    )
}
