import React, {useContext} from 'react'
import { ThemeContext } from 'src/App'
import classNames from 'classnames/bind'
import styles from './styles/Topbar.module.scss'
export default function Topbar() {
    const theme = useContext(ThemeContext)
    const MyClassName = classNames.bind(styles)
    const topbar = MyClassName({
        topbar: true,
        dark: theme.theme === 'dark'
    })
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
                <input type="text" placeholder="搜索" />
            </div>
            <span className={styles.changeTheme} onClick={()=>{theme.toggleTheme()}}>{theme.theme === 'light'?"🌙":"\u2600"}</span>
        </div>
    )
}
