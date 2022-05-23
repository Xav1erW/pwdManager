import React, { useEffect, createContext, useState, EffectCallback } from 'react'
import { generateKeys } from 'src/utils/rsa'
import shortUUID from 'short-uuid'
import Login from './pages/Login/Login'
import Main from './pages/Main/Main'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import api from 'src/utils/api'
import useProxy from './setupProxy'
const uuid = shortUUID.generate()

// generate rsa key pair
const keys = generateKeys()
const publicKey = keys.publicKey
const privateKey = keys.privateKey

export interface authContextType {
    uuid: string
    privateKey: string
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
    privateKey,
    auth: { jwt: '', publicKey: '' },
    dbInfo: {
        dbUUID: '',
        dbName: '',
    },
    setDbInfo: () => { },
}

export const AuthContext = createContext(initialContext)
export const ThemeContext = createContext('dark')


interface dbInfoTyle {
    dbUUID: string,
    dbName: string,
}

function App() {
    const [auth, setAuth] = useState({ jwt: '', publicKey: '' })

    const [dbInfo, setDbInfo] = useState<dbInfoTyle>({ dbUUID: '', dbName: '' })

    useEffect(() => {
        const getData = async () => {
            const data = await api.BeforeLogin(uuid, publicKey)
            return data
        }
        getData().then((data: any) => {
            setAuth(data)
            console.log('data', data)
        })
    }, [])
    return (
        <div>
            <ThemeContext.Provider value='dark'>
                <AuthContext.Provider value={{ uuid, privateKey, auth: auth, dbInfo: dbInfo, setDbInfo }}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/home" element={<Main />} />
                        </Routes>
                    </BrowserRouter>
                </AuthContext.Provider>
            </ThemeContext.Provider>
        </div>
    )
}

export default App;
