import React, { useEffect, createContext, useState, EffectCallback } from 'react'
import { generateKeys } from 'src/utils/rsa'
import shortUUID from 'short-uuid'
import Login from './pages/Login/Login'
import Main from './pages/Main/Main'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import api from 'src/utils/api'

const uuid = shortUUID.generate()

// generate rsa key pair
const keys = generateKeys()
const publicKey = keys.publicKey
const privateKey = keys.privateKey

export const AuthContext = createContext({
    uuid,
    privateKey,
    auth:{jwt:'', publicKey:''}
})
function App() {
    const [auth, setAuth] = useState({jwt:'', publicKey:''})

    useEffect(()=>{
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
            <AuthContext.Provider value={{ uuid, privateKey, auth:auth }}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/home" element={<Main />} />
                    </Routes>
                </BrowserRouter>
            </AuthContext.Provider>
        </div>
    )
}

export default App;
