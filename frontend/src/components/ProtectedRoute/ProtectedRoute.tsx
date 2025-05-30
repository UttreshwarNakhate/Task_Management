import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { JSX } from 'react'
import { RootState } from '@/store'

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken)
  return accessToken ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
