import React, { useState, useEffect } from 'react'

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



function Password(props:pwdInfo|pwdDetailsInfo){
    return (
        <div className={styles.password}>password</div>
    )
}


export default function Main() {
    const [collectionList, setCollectionList] = useState<collectionListTyle>([])
    const [passwordList, setPasswordList] = useState<passwordListTyle>([])
    const [pwdInfo, setPwdInfo] = useState<pwdInfo|pwdDetailsInfo>({} as pwdInfo)
    const [chosenCollection, setChosenCollection] = useState('')
    const [chosenPassword, setChosenPassword] = useState('')
    classNames.bind(styles)
    const collectionNavClass = classNames({
        nav: true,
        collectionNav: true,
    })
    const passwordNavClass = classNames({
        nav: true,
        passwordNav: true,
    })
    const actCollectionItemClass = classNames({
        navItem: true,
        activateItem: true,
        collection: true
    })
    const collectionItemClass = classNames({
        navItem: true,
    })
    const actPasswordItemClass = classNames({
        navItem: true,
        activateItem: true,
        password: true
    })
    const passwordItemClass = classNames({
        navItem: true,
    })
    useEffect(() => {
        api.getCollectionList().then(res => {
            setCollectionList(res.collectionList)
        })
    }, [])

    const chooseCollection = (collectionUUID: string) => {
        return ()=>{
            setChosenCollection(collectionUUID)
            api.getPasswordList(collectionUUID).then(res => {
                setPasswordList(res.passwordList)
            })
        }
    }
    const choosePassword = (passwordUUID: string) => {
        return ()=>{
            setChosenPassword(passwordUUID)
            api.getPasswordInfo(passwordUUID).then(res => {
                setPwdInfo(res)
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
                        <div className={chosenCollection===item.uuid?actCollectionItemClass:collectionItemClass} key={item.uuid} onClick={chooseCollection(item.uuid)}>
                            <span>{item.name}</span>
                            <hr/>
                        </div>
                    ))}
                </div>
                {passwordList?<div className={passwordNavClass}>
                    {passwordList.map(item =>(
                        <div className={chosenPassword===item.uuid?actPasswordItemClass:passwordItemClass} key={item.uuid}>
                            <span>{item.name}</span>
                            <hr/>
                        </div>
                    ))}
                </div>:null}
                {pwdInfo?<Password {...pwdInfo}/>:null}
            </div>
        </div>
    )
}
