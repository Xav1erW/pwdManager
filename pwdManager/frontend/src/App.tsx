import React from 'react'

import Login from './pages/Login/Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
    return (
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App;
