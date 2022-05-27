import React, {useContext, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeContext } from 'src/App'
import classNames from 'classnames/bind'
import styles from './styles/Topbar.module.scss'
import api from 'src/utils/api'

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
    return (
        <div className={topbar}>
            <div className={styles.options}>
                <span className={styles.option}>打开(O)</span>
                <span className={styles.option}>新建(N)</span>
                <span className={styles.option}>添加(A)</span>
                <span className={styles.option}>删除(D)</span>
                <span className={styles.option}>密码生成器(G)</span>
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
