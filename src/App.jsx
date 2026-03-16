import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import ListPage from './pages/ListPage'
import DetailsPage from './pages/DetailsPage'
import AnalyticsPage from './pages/AnalyticsPage'
export default function App() {
  return (
    <>
      <div className="app-bg" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/list" element={<ProtectedRoute><ListPage /></ProtectedRoute>} />
            <Route path="/details/:id" element={<ProtectedRoute><DetailsPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}
