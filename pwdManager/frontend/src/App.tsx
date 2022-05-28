import React, { useEffect, createContext, useState, EffectCallback, ReactChild } from 'react'
import { generateKeys } from 'src/utils/rsa'
import shortUUID from 'short-uuid'
import Login from './pages/Login/Login'
import Main from './pages/Main/Main'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import api from 'src/utils/api'
import useProxy from './setupProxy'
import SearchResult from './pages/SearchResult/SearchResult'
import NewDatabase from './pages/NewDatabase/NewDatabase'
const uuid = shortUUID.generate()

// generate rsa key pair
// const keys = generateKeys()
// const publicKey = keys.publicKey
// const privateKey = keys.privateKey

export interface authContextType {
    uuid: string
    // privateKey: string
    auth: {
        jwt: string
        publicKey: string
    }
    dbInfo: {
        dbName: string
        dbUUID: string
    },
    setDbInfo: (dbInfo: { dbName: string, dbUUID: string }) => void
}

const initialContext: authContextType = {
    uuid,
    // privateKey,
    auth: { jwt: '', publicKey: '' },
    dbInfo: {
        dbUUID: '',
        dbName: '',
    },
    setDbInfo: () => { },
}

export const AuthContext = createContext(initialContext)


interface dbInfoTyle {
    dbUUID: string,
    dbName: string,
}

export const ThemeContext = createContext({theme:'dark', toggleTheme: () => {}})
function ThemeProvider ({ children, defaultTheme }:React.PropsWithChildren<{defaultTheme:string}> ) {
    const [theme, setTheme] = useState(defaultTheme)
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }
    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}


function App() {
    const [auth, setAuth] = useState({ jwt: '', publicKey: '' })
    
    const [dbInfo, setDbInfo] = useState<dbInfoTyle>({ dbUUID: '', dbName: '' })

    const [defaultTheme, setDefaultTheme] = useState('')

    useEffect(() => {
        const getData = async () => {
            const data = await api.BeforeLogin(uuid)
            return data
        }
        getData().then((data: any) => {
            setAuth(data)
            console.log('data', data)
        })
    }, [])

    useEffect(()=>{
        api.getDefaultConfig().then((data:any)=>{
            setDefaultTheme(data.defaultTheme)
        })
    },[])
    return (
        <div>
            <ThemeProvider defaultTheme={defaultTheme}>
                <AuthContext.Provider value={{ uuid, auth: auth, dbInfo: dbInfo, setDbInfo }}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/home" element={<Main />} />
                            <Route path="/search" element={<SearchResult />} />
                            <Route path="/new" element={<NewDatabase />} />
                        </Routes>
                    </BrowserRouter>
                </AuthContext.Provider>
            </ThemeProvider>
        </div>
    )
}

export default App;
