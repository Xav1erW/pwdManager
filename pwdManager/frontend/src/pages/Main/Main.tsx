import React, { useState, useEffect, useRef, useContext } from 'react'

import classNames from 'classnames/bind'
import api from 'src/utils/api'
import Topbar from 'src/Components/Topbar/Topbar'
import styles from './styles/Main.module.scss'
import { ThemeContext } from 'src/App'
import plusIcon from './assets/plus.svg'
import plusIconDark from './assets/plus_dark.svg'

interface collectionItemTyle {
    name: string,
    uuid: string
}

interface passwordItemTyle {
    name: string,
    uuid: string
}

interface pwdInfo {
    title: string,
    username: string,
    password: string,
    url: string,
    description: string,
    uuid?: string
}

interface pwdDetailsInfo {
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
    uuid?: string

}

interface collectionListTyle extends Array<collectionItemTyle> { }
interface passwordListTyle extends Array<passwordItemTyle> { }


function Password(props: { info: pwdInfo | pwdDetailsInfo, setInfo: Function, delPassword: Function, colUUID: string }) {
    const { title, username, password, url, description } = props.info
    const [show, setShow] = useState(false)
    const handleAttrChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const attr = e.target.attributes.getNamedItem('name')!.value
        const value = e.target.value
        props.setInfo({ ...props.info, [attr]: value })
    }
    const saveChange = () => {
        if (props.info.uuid && props.info.uuid[0] === '-') {
            // 这是新加入的密码
            // 检测必要信息
            if (props.info.username === '' && props.info.password === '') {
                alert('请至少输入用户名和密码')
                return
            }
            api.createPassword(props.info, props.colUUID)
        }
        else if (props.info.uuid) {
            api.savePassword(props.info, props.colUUID, props.info.uuid)
        }
    }

    const delPwd = () => {
        props.delPassword()
    }
    const theme = useContext(ThemeContext)

    const MyClassName = classNames.bind(styles)
    const passwordStyle = MyClassName({
        password: true,
        dark: theme.theme === 'dark'
    })

    return (
        <div className={passwordStyle}>
            <div className={styles.title}>
                <input value={title} name={'title'} onChange={handleAttrChange} />
            </div>
            <div className={styles.editable}>
                <label>
                    <span>用户名</span>
                    <div className={styles.inputBox}>
                        <input type={'text'} value={username} name={'username'} onChange={handleAttrChange} />
                    </div>
                </label>
            </div>
            <div className={styles.editable}>
                <label>
                    <span>密码</span>
                    <div className={styles.inputBox}>
                        <input type={show ? 'text' : 'password'} value={password} name={'password'} onChange={handleAttrChange} />
                    </div>
                </label>
            </div>
            <div className={styles.editable}>
                <label>
                    <span>url</span>
                    <div className={styles.inputBox}>
                        <input type={'text'} value={url} name={'url'} onChange={handleAttrChange} />
                    </div>
                </label>
            </div>
            <div className={`${styles.editable} ${styles.des}`}>
                <label>
                    <span>备注</span>
                    <div className={styles.textareBox}>
                        <textarea value={description} name={'description'} onChange={handleAttrChange} />
                    </div>
                </label>
            </div>
            <div className={styles.btns}>
                <span className={styles.btn} onClick={saveChange}>保存修改</span>
                <span className={styles.btn} onClick={delPwd}>删除</span>
            </div>
        </div>
    )
}


export default function Main() {
    const [collectionList, setCollectionList] = useState<collectionListTyle>([])
    const [passwordList, setPasswordList] = useState<passwordListTyle>([])
    const [pwdInfo, setPwdInfo] = useState<pwdInfo | pwdDetailsInfo>({} as pwdInfo)
    const [chosenCollection, setChosenCollection] = useState('')
    const [chosenPassword, setChosenPassword] = useState('')
    const cx = classNames.bind(styles)
    const {theme, toggleTheme} = useContext(ThemeContext)
    let tempNewUUID = -1

    const collectionNavClass = cx({
        nav: true,
        collectionNav: true,
        dark: theme === 'dark'
    })
    const passwordNavClass = cx({
        nav: true,
        passwordNav: true,
        dark: theme === 'dark'
    })
    const actCollectionItemClass = cx({
        navItem: true,
        activateItem: true,
        collectionOption: true,
        dark: theme === 'dark'
    })
    const collectionItemClass = cx({
        navItem: true,
        dark: theme === 'dark'
    })
    const actPasswordItemClass = cx({
        navItem: true,
        activateItem: true,
        passwordOption: true,
        dark: theme === 'dark'
    })
    const passwordItemClass = cx({
        navItem: true,
        dark: theme === 'dark'
    })

    const mainPage = cx({
        mainPage: true,
        dark: theme === 'dark'
    })
    useEffect(() => {
        api.getCollectionList().then(res => {
            setCollectionList(res.collectionList)
        })
    }, [])

    useEffect(() => {
        // info内名字变化，collection显示名字同步变化
        if (pwdInfo.uuid) {
            // temp.name = pwdInfo.title
            let list = [...passwordList]
            list.forEach(item => {
                if (item.uuid === pwdInfo.uuid) {
                    item.name = pwdInfo.title
                }
            })
            setPasswordList([...list])
        }
    }, [pwdInfo])

    const chooseCollection = (collectionUUID: string) => {
        return () => {
            setChosenCollection(collectionUUID)
            api.getPasswordList(collectionUUID).then(res => {
                setPasswordList(res.passwordList)
            })
        }
    }
    const choosePassword = (passwordUUID: string) => {
        return () => {
            setChosenPassword(passwordUUID)
            api.getPasswordInfo(passwordUUID, chosenCollection).then(res => {
                setPwdInfo({ ...res, uuid: passwordUUID })
                console.log(res)
            })
        }
    }

    const addPwd = () => {
        const newPwdInfo: pwdDetailsInfo = {
            title: '新密码',
            username: '',
            password: '',
            url: '',
            description: '',
            updateDate: '',
            createTime: 0,
            updateTime: 0,
            updateHistory: [],
            autoComplete: false,
            matchRules: [],
            uuid: tempNewUUID.toString()
        }
        setPasswordList([...passwordList, { name: newPwdInfo.title, uuid: newPwdInfo.uuid as string }])
        tempNewUUID -= 1
        setPwdInfo(newPwdInfo)
    }

    const delPassword = () => {
        api.deletePassword(chosenPassword, chosenCollection)
        setPasswordList(passwordList.filter(item => item.uuid !== chosenPassword))
        setChosenPassword('')
        setPwdInfo({} as pwdInfo)
    }

    return (
        <div className={mainPage}>
            <Topbar />
            <div className={styles.mainContent}>
                <div className={collectionNavClass}>
                    {collectionList.map(item =>
                    (
                        <div className={chosenCollection === item.uuid ? actCollectionItemClass : collectionItemClass} key={item.uuid} onClick={chooseCollection(item.uuid)}>
                            <span>{item.name}</span>
                            {/* <hr/> */}
                        </div>
                    ))}
                    <div>
                        <img width={'20px'} height={'20px'} src={theme === 'dark' ? plusIconDark : plusIcon} alt={'plus'} className={styles.plusIcon} onClick={() => { }} />
                    </div>
                </div>
                {passwordList.length === 0 ? null : <div className={passwordNavClass}>
                    {passwordList.map(item => (
                        <div className={chosenPassword === item.uuid ? actPasswordItemClass : passwordItemClass} key={item.uuid} onClick={choosePassword(item.uuid)}>
                            <span>{item.name}</span>
                            {/* <hr/> */}
                        </div>
                    ))}
                    <div>
                        <img width={'20px'} height={'20px'} src={theme === 'dark' ? plusIconDark : plusIcon} alt={'plus'} className={styles.plusIcon} onClick={addPwd} />
                    </div>
                </div>}
                <div className={styles.contentDisplay}>
                    {/* {Object.keys(pwdInfo).length === 0 ? null : <div style={{ width: '80%' }}><Password info={pwdInfo} setInfo={setPwdInfo} delPassword={delPassword} colUUID={chosenCollection} /></div>} */}
                    {Object.keys(pwdInfo).length === 0 ? null : <div ><Password info={pwdInfo} setInfo={setPwdInfo} delPassword={delPassword} colUUID={chosenCollection} /></div>}
                </div>
            </div>
        </div>
    )
}
