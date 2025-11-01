import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthProvider";
import ProtectedRoute from "./wrappers/ProtectedRoute";

import Home from "./pages/Home"
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Listings from "./pages/Listings"

import Account from "./pages/accounts/Account";
function App() {
  return (
    <>
      <AuthProvider >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<ProtectedRoute><SignupForm /></ProtectedRoute>} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
