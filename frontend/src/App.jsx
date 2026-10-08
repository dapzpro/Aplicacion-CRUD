import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Products from './Products';

function Private({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Private>
            <Products />
          </Private>
        }
      />
    </Routes>
  );
}
