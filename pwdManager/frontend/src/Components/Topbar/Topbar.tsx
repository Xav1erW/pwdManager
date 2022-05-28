import React, {useContext, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from 'src/App'
import classNames from 'classnames/bind'
import styles from './styles/Topbar.module.scss'
import api from 'src/utils/api'
import logo from './assets/logo512.png'
import PubSub from 'pubsub-js'

interface SearchResultType {
    name: string;
    pwdID: string;
    colID: string;
}

export default function Topbar() {
    const theme = useContext(ThemeContext)
    const [search, setSearch] = useState('')
    const [searchList, setSearchList] = useState<SearchResultType[]>([] as SearchResultType[])
    const MyClassName = classNames.bind(styles)
    const navigate = useNavigate()
    const topbar = MyClassName({
        topbar: true,
        dark: theme.theme === 'dark'
    })
    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        const res = await api.searchPassword(e.target.value)
        setSearchList(res)
    }

    const jumpTo = (pwdID: string, colID: string):React.MouseEventHandler<HTMLSpanElement> => {
        return (e: React.MouseEvent<HTMLSpanElement>): void => {
            navigate(`/search?pwdID=${pwdID}&colID=${colID}`)
        }
    }

    const reOpen = ()=>{
        // reopen a database
        navigate('/')
    }

    const newDB = ()=>{
        // create a new database
        navigate('/new')
    }

    const delCurrentCol = (e:React.MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation()
        PubSub.publish('delCurrentCol', 'del')
    }
    return (
        <div className={topbar}>
            <div className={styles.options}>
                <img width={'32px'} height={'32px'} src={logo} alt="logo" />
                <span className={styles.option} onClick={reOpen}>重新打开</span>
                <span className={styles.option} onClick={newDB}>新建数据库</span>
                <span className={styles.option} onClick={delCurrentCol}>删除当前合集</span>
            </div>
            <div className={styles.search}>
                <input type="text" placeholder="搜索" value={search} onChange={handleSearch}/>
                <div className={styles.searchList}>
                    {searchList.length!==0?searchList.map((item: SearchResultType) => (
                        <span key={item.pwdID} onClick={jumpTo(item.pwdID, item.colID)}>{item.name}</span>
                    )):null}
                </div>
            </div>
            <span className={styles.changeTheme} onClick={()=>{theme.toggleTheme()}}>{theme.theme === 'light'?"🌙":"\u2600"}</span>
        </div>
    )
}
