import React, { useState, useEffect, useRef, useContext } from 'react'

import classNames from 'classnames/bind'
import DatePicker, { DatePickerProps } from 'react-date-picker/dist/entry.nostyle'
import api from 'src/utils/api'
import Topbar from 'src/Components/Topbar/Topbar'
import PwdGenerator from 'src/Components/PwdGenerator/PwdGenerator'
import styles from './styles/Main.module.scss'
import { ThemeContext } from 'src/App'
import plusIcon from './assets/plus.svg'
import plusIconDark from './assets/plus_dark.svg'
import hiddenIcon from './assets/hidden.svg'
import showIcon from './assets/show.svg'
import genIcon from './assets/gen.svg'
import showIconDark from './assets/showDark.svg'
import hiddenIconDark from './assets/hiddenDark.svg'
import './styles/DatePicker.css'
import './styles/Calendar.css'

interface collectionItemTyle {
    name: string,
    uuid: string
}

interface passwordItemTyle {
    name: string,
    uuid: string
}

export interface pwdInfo {
    title: string,
    username: string,
    password: string,
    url: string,
    description: string,
    uuid?: string
}

export interface pwdDetailsInfo {
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


function DetailPassword(props: { pwdInfo: pwdDetailsInfo, onEdit: (attrName: string, value: any) => void , saveChange: () => void, closeDetail: () => void}) {
    const { title, username, password, url, description, updateDate, createTime, updateTime, updateHistory, autoComplete, matchRules, uuid } = props.pwdInfo
    const { onEdit, saveChange, closeDetail } = props
    const theme = useContext(ThemeContext)
    const [show, setShow] = useState(false)
    let initDate:Date|null = new Date(updateDate)
    if(updateDate === '') {
        initDate = null
    }
    const [date, setDate] = useState(initDate)
    const Date2Str = (date: Date) => {
        // format: yyyy-MM-dd
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${year}-${(month + "").padStart(2, '0')}-${(day + "").padStart(2, '0')}`
    }
    const changeDate = (e: Date) => {
        setDate(e)
        const strDate = Date2Str(e)
        onEdit('updateDate', strDate)
    }

    const MyClass = classNames.bind(styles)
    const detailClass = MyClass({
        'detail-password': true,
        'dark': theme.theme === 'dark',
    })

    const formatDate = (date:Date) => {
        // yyyy-MM-dd HH:mm:ss
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()
        return `${year}-${(month + "").padStart(2, '0')}-${(day + "").padStart(2, '0')} ${(hour + "").padStart(2, '0')}:${(minute + "").padStart(2, '0')}:${(second + "").padStart(2, '0')}`

    }
    return (
        <div className={detailClass}>
            <div className={styles.detailInfo}>
                <span>密码更新提醒</span>
                <DatePicker value={date} onChange={changeDate} />
            </div>
            <div className={styles.detailInfo}>
                <span>创建时间</span>
                <span>{formatDate(new Date(createTime*1000))}</span>
            </div>
            <div className={styles.detailInfo}>
                <span>最近更新时间</span>
                <span>{formatDate(new Date(updateTime*1000))}</span>

            </div>
            <div className={styles.detailInfo}>
                <span>历史密码</span>
                <div className={styles.historyPwd}>
                    {updateHistory==[]?null:updateHistory.map((item, index) => {
                        return <span key={index}>{item}</span>
                    })}
                </div>
            </div>
            <div className={styles.btns}>
                <span className={styles.btn} onClick={saveChange}>保存修改</span>
                <span className={styles.btn} onClick={closeDetail}>关闭</span>
            </div>
        </div>
    )
}



export function Password(props: { info: pwdInfo | pwdDetailsInfo, setInfo: Function, delPassword: Function, colUUID: string, setShowGen: Function }) {
    const { title, username, password, url, description } = props.info
    // 显示密码生成器
    const [show, setShow] = useState(false)
    const [showPwd, setShowPwd] = useState(false)
    const [showDetail, setShowDetail] = useState(false)
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
            api.createPassword(props.info, props.colUUID).then((res)=>{
                console.log(res)
                const newPasswordInfo = res.data
                props.setInfo({...props.info, ...newPasswordInfo })
            })
        }
        else if (props.info.uuid) {
            api.savePassword(props.info, props.colUUID, props.info.uuid)
        }
    }

    const editDetail = (attrName: string, value: any) => {
        console.log(attrName, value)
        props.setInfo({ ...props.info, [attrName]: value })
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
        !showDetail ?
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
                            <input type={showPwd ? 'text' : 'password'} value={password} name={'password'} onChange={handleAttrChange} />
                            <img src={genIcon} onClick={() => props.setShowGen(true)} width={'20px'} height={'20px'} />
                            {showPwd ? <img src={theme.theme === 'dark' ? hiddenIconDark : hiddenIcon} onClick={() => { setShowPwd(false) }} width={'20px'} height={'20px'} /> : <img src={theme.theme === 'dark' ? showIconDark : showIcon} onClick={() => { setShowPwd(true) }} width={'20px'} height={'20px'} />}
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
                    <span className={styles.btn} onClick={() => { setShowDetail(true) }}>详细信息</span>
                </div>
            </div>
            : <DetailPassword pwdInfo={props.info as pwdDetailsInfo} onEdit={editDetail} saveChange={saveChange} closeDetail={()=>{setShowDetail(false)}}/>
    )
}


export default function Main() {
    const [collectionList, setCollectionList] = useState<collectionListTyle>([])
    const [passwordList, setPasswordList] = useState<passwordListTyle>([])
    const [pwdInfo, setPwdInfo] = useState<pwdInfo | pwdDetailsInfo>({} as pwdInfo)
    const [chosenCollection, setChosenCollection] = useState('')
    const [chosenPassword, setChosenPassword] = useState('')
    const [showGren, setShowGren] = useState(false)
    const cx = classNames.bind(styles)
    const { theme, toggleTheme } = useContext(ThemeContext)
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
            console.log(collectionUUID)
            setChosenCollection(collectionUUID)
            api.getPasswordList(collectionUUID).then(res => {
                setPasswordList(res.passwordList)
            })
        }
    }
    const choosePassword = (passwordUUID: string) => {
        return () => {
            setChosenPassword(passwordUUID)
            api.getPasswordInfo(passwordUUID, chosenCollection, true).then(res => {
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

    const setGenPwd = (pwd: string) => {
        setPwdInfo({ ...pwdInfo, password: pwd })
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
                {passwordList.length === 0 ? <div className={passwordNavClass}>
                    <div>
                        <img width={'20px'} height={'20px'} src={theme === 'dark' ? plusIconDark : plusIcon} alt={'plus'} className={styles.plusIcon} onClick={addPwd} />
                    </div>
                </div>: <div className={passwordNavClass}>
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
                    {Object.keys(pwdInfo).length === 0 ? null : <div style={{}}><Password info={pwdInfo} setInfo={setPwdInfo} delPassword={delPassword} colUUID={chosenCollection} setShowGen={setShowGren} /></div>}
                </div>
            </div>
            <PwdGenerator show={showGren} setShow={setShowGren} setPwd={setGenPwd} />
        </div>
    )
}
