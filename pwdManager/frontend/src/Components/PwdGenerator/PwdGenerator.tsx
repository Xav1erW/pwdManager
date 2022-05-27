import React, { useState, useRef } from 'react'

import { ThemeContext } from 'src/App'
import classNames from 'classnames/bind'
import styles from './styles/PwdGenerator.module.scss'
import hiddenIcon from './assets/hidden.svg'
import showIcon from './assets/show.svg'
import hiddenIconDark from './assets/hiddenDark.svg'
import showIconDark from './assets/showDark.svg'

const lowerCase = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',]
const upperCase = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',]
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const specialChar = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=', '{', '}', '[', ']', '|', ':', ';', '"', '\'', '<', '>', '?', '~', '`', '.', ',', '\\', '/', ' ']

export default function PwdGenerator(props: any) {
    const { show, setShow, setPwd } = props
    const [genetatedPwd, setGenetatedPwd] = useState('')
    const [pwdLength, setPwdLength] = useState(16)
    const [pwdCharSet, setPwdCharSet] = useState([] as string[])
    const [showPwd, setShowPwd] = useState(false)
    const MyStyle = classNames.bind(styles)
    const theme = React.useContext(ThemeContext)
    const GeneratedPwd = useRef<HTMLInputElement>(null)
    const GeneratorClass = MyStyle({
        Pwd_Generator: true,
        dark: theme.theme === 'dark',
        show: show,
    })
    const handleAttrChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // const attr = e.target.attributes.getNamedItem('name')!.value
        const value = e.target.value
        setGenetatedPwd(value)
    }

    const genPwd = () => {
        let pwd = ''
        if (pwdCharSet.length === 0) {
            alert('请选择密码字符集')
            return;
        }
        for (let i = 0; i < pwdLength; i++) {
            const index = Math.floor(Math.random() * pwdCharSet.length)
            if (pwd.includes(pwdCharSet[index])) {
                // 去掉重复的字符
                i--
                continue
            }
            pwd += pwdCharSet[index]
        }
        setGenetatedPwd(pwd)
    }

    const applicatePwd = () => {
        if (setPwd !== undefined) {
            setPwd(genetatedPwd)
        }
        setShow(false)
    }
    return (
        <div className={GeneratorClass}>
            <div className={styles.generatorPannel}>
                <div className={styles.cross}>
                    <span onClick={() => { setShow(false) }}>X</span>
                </div>
                <div className={styles.pwdDisplay}>
                    <input type={showPwd ? 'text' : 'password'} value={genetatedPwd} onChange={handleAttrChange} ref={GeneratedPwd} />
                    {showPwd ? <img src={theme.theme === 'dark' ? hiddenIconDark : hiddenIcon} onClick={() => setShowPwd(false)} width={'30px'} height={'30px'} /> : <img src={theme.theme === 'dark' ? showIconDark : showIcon} onClick={() => setShowPwd(true)} width={'30px'} height={'30px'} />}
                </div>
                <div className={styles.options}>
                    <div className={styles.option}>
                        <span>长度：</span>
                        <div className={styles.optInput}>
                            <input type={'text'} value={pwdLength} onChange={(e) => {
                                setPwdLength(parseInt(e.target.value))
                            }} />
                        </div>
                    </div>
                </div>
                <div className={styles.options}>
                    <div className={styles.option}>
                        <span>字符类型：</span>
                        <div className={styles.optBtns}>
                            <span className={pwdCharSet.includes('A') ? styles.actBtn : ''} onClick={() => {
                                if (pwdCharSet.includes('A')) {
                                    const newSet = pwdCharSet.filter(item => !upperCase.includes(item))
                                    setPwdCharSet(newSet)
                                } else {
                                    setPwdCharSet([...pwdCharSet, ...upperCase])
                                }
                            }}>A-Z</span>
                            <span className={pwdCharSet.includes('a') ? styles.actBtn : ''} onClick={() => {
                                if (pwdCharSet.includes('a')) {
                                    const newSet = pwdCharSet.filter(item => !lowerCase.includes(item))
                                    setPwdCharSet(newSet)
                                } else {
                                    setPwdCharSet([...pwdCharSet, ...lowerCase])
                                }
                            }}>a-z</span>
                            <span className={pwdCharSet.includes('0') ? styles.actBtn : ''} onClick={() => {
                                if (pwdCharSet.includes('0')) {
                                    const newSet = pwdCharSet.filter(item => !numbers.includes(item))
                                    setPwdCharSet(newSet)
                                } else {
                                    setPwdCharSet([...pwdCharSet, ...numbers])
                                }
                            }}>0-9</span>
                            <span className={pwdCharSet.includes('#') ? styles.actBtn : ''} onClick={() => {
                                if (pwdCharSet.includes('#')) {
                                    const newSet = pwdCharSet.filter(item => !specialChar.includes(item))
                                    setPwdCharSet(newSet)
                                } else {
                                    setPwdCharSet([...pwdCharSet, ...specialChar])
                                }
                            }}>#/%$_*</span>
                        </div>
                    </div>
                </div>
                <div className={styles.genBtns}>
                    <span onClick={genPwd}>生成</span>
                    <span onClick={() => {
                        // console.log(genetatedPwd)
                        // if (!GeneratedPwd.current) {
                            GeneratedPwd.current!.select()
                            navigator.clipboard.writeText(genetatedPwd)
                        // }
                    }}>复制</span>
                    <span onClick={applicatePwd}>应用</span>
                </div>
            </div>
        </div>
    )
}
