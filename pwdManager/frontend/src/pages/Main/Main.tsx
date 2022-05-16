import React, { useState, useEffect, useRef } from 'react'

import classNames from 'classnames/bind'
import api from 'src/utils/api'
import Topbar from 'src/Components/Topbar/Topbar'
import styles from './styles/Main.module.scss'

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
    description: string
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

}

interface collectionListTyle extends Array<collectionItemTyle> { }
interface passwordListTyle extends Array<passwordItemTyle> { }



function Password(props: {info: pwdInfo | pwdDetailsInfo, setInfo:Function}) {
    const { title, username, password, url, description } = props.info
    const [show, setShow] = useState(false)
    const handleAttrChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const attr = e.target.attributes.getNamedItem('name')!.value
        const value = e.target.value
        props.setInfo({ ...props.info, [attr]: value })
    }
    const saveChange = () => {
        api.savePassword(props.info)
    }
    return (
        <div className={styles.password}>
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
    const collectionNavClass = cx({
        nav: true,
        collectionNav: true,
    })
    const passwordNavClass = cx({
        nav: true,
        passwordNav: true,
    })
    const actCollectionItemClass = cx({
        navItem: true,
        activateItem: true,
        collectionOption: true
    })
    const collectionItemClass = cx({
        navItem: true,
    })
    const actPasswordItemClass = cx({
        navItem: true,
        activateItem: true,
        passwordOption: true
    })
    const passwordItemClass = cx({
        navItem: true,
    })
    useEffect(() => {
        api.getCollectionList().then(res => {
            setCollectionList(res.collectionList)
        })
    }, [])

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
            api.getPasswordInfo(passwordUUID).then(res => {
                setPwdInfo(res)
                console.log(res)
            })
        }
    }
    return (
        <div className={styles.mainPage}>
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
                </div>
                {passwordList.length === 0 ? null : <div className={passwordNavClass}>
                    {passwordList.map(item => (
                        <div className={chosenPassword === item.uuid ? actPasswordItemClass : passwordItemClass} key={item.uuid} onClick={choosePassword(item.uuid)}>
                            <span>{item.name}</span>
                            {/* <hr/> */}
                        </div>
                    ))}
                </div>}
                <div className={styles.contentDisplay}>
                    {Object.keys(pwdInfo).length === 0 ? null : <Password info={pwdInfo} setInfo={setPwdInfo} />}
                </div>
            </div>
        </div>
    )
}
