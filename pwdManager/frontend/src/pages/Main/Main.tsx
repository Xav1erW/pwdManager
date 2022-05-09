import React from 'react'

import Topbar from 'src/Components/Topbar/Topbar'
import styles from './styles/Main.module.scss'
export default function Main() {
    return (
        <div className={styles.mainPage}>
            <Topbar/>
        </div>
    )
}
