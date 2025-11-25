import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/context/AuthProvider";
import ProtectedRoute from "./wrappers/ProtectedRoute";

import Home from "./pages/Home"
import Signup from "./pages/Signup";
import Listings from "./pages/Listings"
import CreateListing from "./pages/Sell";
import ListingDetail from "./pages/ListingDetail";
import Login from "./pages/Login"

import Account from "./pages/accounts/Account";
function App() {
  return (
    <>
      <AuthProvider >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element = {<ListingDetail />}/>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/sell" element = {<CreateListing/>}/>
            <Route path="/account" element={<Account />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
