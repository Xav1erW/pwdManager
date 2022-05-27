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
import { pwdInfo, pwdDetailsInfo } from './Main'

export default function Password(props: { info: pwdInfo | pwdDetailsInfo, setInfo: Function, delPassword: Function, colUUID: string, setShowGen: Function }) {
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
            api.createPassword(props.info, props.colUUID).then((res) => {
                console.log(res)
                props.setInfo({ ...props.info, res })
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
                            {/* <img src={genIcon} onClick={() => props.setShowGen(true)} width={'20px'} height={'20px'} /> */}
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
                    {/* <span className={styles.btn} onClick={saveChange}>保存修改</span>
                    <span className={styles.btn} onClick={delPwd}>删除</span>
                    <span className={styles.btn} onClick={() => { setShowDetail(true) }}>详细信息</span> */}
                </div>
            </div>
            :null// : <DetailPassword pwdInfo={props.info as pwdDetailsInfo} onEdit={editDetail} saveChange={saveChange} closeDetail={() => { setShowDetail(false) }} />
    )
}
