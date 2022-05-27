import React ,{useState, useEffect, useContext} from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'
import api from 'src/utils/api'
import Password from '../Main/Password'
import { pwdDetailsInfo, pwdInfo } from '../Main/Main'
import { ThemeContext } from 'src/App'
import styles from './styles/SearchResult.module.scss'


export default function SearchResult() {
    const [params, setParams] = useSearchParams()
    const [pwdInfo, setPwdInfo] = useState<pwdDetailsInfo|pwdInfo>({} as pwdDetailsInfo)
    const [location, setLocation] = useState('')
    const navigate = useNavigate()
    const theme = useContext(ThemeContext)
    useEffect(()=>{
        console.log(params)
        const pwdID:string = params.get('pwdID') as string
        const colID = params.get('colID') as string

        api.getPasswordInfo(pwdID, colID, true).then((res)=>{
            setPwdInfo(res)
        })
    }, [params])

    const delPassword = () => {
        api.deletePassword(params.get('pwdID') as string, params.get('colID') as string)
        setPwdInfo({} as pwdInfo)
    }

    useEffect(()=>{
        const getDB = async ()=>{
            const data = await api.getCollectionList()
            const ColName = data.collectionList.find((item:any)=>item.uuid === params.get('colID') as string)
            const PwdName = pwdInfo.title
            setLocation(`${ColName!.name}/${PwdName}`)
        }
        getDB()
    }, [params])

    const MyClassName = classNames.bind(styles)
    const searchStyle = MyClassName({
        searchResult:true,
        dark: theme.theme === 'dark'
    })

    return (
        <div className={searchStyle}>
            <span className={styles.location}>{location}</span>
            <Password info={pwdInfo} setInfo={setPwdInfo} delPassword={delPassword} colUUID={params.get('colID') as string} setShowGen={()=>{}}/>
            <span onClick={()=>{navigate('/home')}} className={styles.back}>{"<返回"}</span>
        </div>
    )
}
