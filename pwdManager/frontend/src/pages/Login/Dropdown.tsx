import React, { useState, useEffect, useContext } from 'react'
import classNames from 'classnames/bind';
import styles from './styles/Dropdown.module.scss';
import {ThemeContext} from 'src/App';

// a dropdown selector component by using ul for the user to select the file
// in the props.files array

// props:
// files: array of files to be displayed in the dropdown
interface FileInfo {
    name: string;
    uuid: string;
}


export default function Dropdown(props: any): JSX.Element {
    const { files, selected, onSelect } = props
    const themeContext = useContext(ThemeContext)

    const [show, setShow] = useState(false)
    const [selectedItem, setSelectedItem] = useState(selected)

    useEffect(() => {
        setSelectedItem(selected)
    }, [selected])

    const handleClick = (e: React.MouseEvent): void => {
        setShow(!show)
    }

    const handleSelect = (uuid: string): React.MouseEventHandler => {
        return (e:any)=>{
            const {innerHTML} = e.target
            setSelectedItem(innerHTML)
            setShow(false)
            onSelect(uuid)
        }
    }
    
    const MyClassName = classNames.bind(styles)
    const dropdown = MyClassName({
        dropdown: true,
        dark: themeContext === 'dark'
    })

    return (
        <div className={dropdown}>
            {selectedItem}
            <span className={styles.dropbtn} onClick={handleClick}/>
            <ul className={show ? styles.show : styles.hide}>
                {files.map((item: FileInfo) => (
                    <li key={item.uuid} onClick={handleSelect(item.uuid)}>{item.name}</li>
                ))}
            </ul>
        </div>
    )
}


