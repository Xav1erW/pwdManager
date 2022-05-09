import React from 'react'

import styles from './styles/Topbar.module.scss'
export default function Topbar() {
    return (
        <div className={styles.topbar}>
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
        </div>
    )
}
