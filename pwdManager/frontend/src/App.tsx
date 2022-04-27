import React, { useEffect, createContext, useState } from 'react'
import axios from 'axios'
import { generateKeys } from 'src/utils/rsa'
import shortUUID from 'short-uuid'
import Login from './pages/Login/Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

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

    useEffect((): void => {
        const requester = axios.create({
            baseURL: 'http://127.0.0.1:4523/mock/862776',
            timeout: 1000
        })
        requester.post('/api/auth', {
            'session id': uuid,
            'public key': publicKey
        }).then((response: any): void => {
            const jwt:string = response.data.jwt
            const publicKey:string = response.data["public key"]
            setAuth({
                jwt,
                publicKey
            })
            console.log(response.data)
        }).catch((error: any): void => {
            console.log(error)
        })
    }, [])
    return (
        <div>
            <AuthContext.Provider value={{ uuid, privateKey, auth:auth }}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Login />} />
                    </Routes>
                </BrowserRouter>
            </AuthContext.Provider>
        </div>
    )
}

export default App;
