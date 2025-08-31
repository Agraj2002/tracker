import React, { useState, useCallback, useEffect } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, isAuthenticated, clearError } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when component unmounts or form changes
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  useEffect(() => {
    if (email || password) {
      setLocalError(null);
      clearError();
    }
  }, [email, password, clearError]);

  // Handle Login Form Submit with useCallback for optimization
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validateEmail(email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setLocalError("Please enter the password");
      return;
    }

    setLocalError("");

    // Login API Call
    const result = await login({ email, password });
    
    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [email, password, login, navigate, location]);

  const displayError = localError || error;

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
       <h3 className='text-xl font-semibold text-black'>Welcome Back</h3>
       <p className='text-xs text-slate-700 mt-[5px] mb-6'>
        Please Enter your details to log in
       </p>

      <form onSubmit={handleLogin}>
        <Input
         value={email}
         onChange={({target})=>setEmail(target.value)}
         label="Email Address"
         placeholder="john@example.com"
         type="text"
         disabled={loading}
         />

         <Input
         value={password}
         onChange={({target})=>setPassword(target.value)}
         label="Password"
         placeholder="Min 8 Characters"
         type="password"
         disabled={loading}
         />

         {displayError && <p className='text-red-500 text-xs pb-2.5'>{displayError}</p>}
         
         <button 
           type='submit' 
           className='btn-primary flex items-center justify-center'
           disabled={loading}
         >
          {loading ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Logging in...</span>
            </>
          ) : (
            'LOGIN'
          )}
         </button>
         
         <p className='text-[13px] text-slate-800 mt-3'>Don't have an account?{" "}
           <Link className="font-medium text-primary underline" to="/signup">
            SignUp
           </Link>
         </p>
         
         {/* Demo credentials section */}
         <div className="mt-6 p-4 bg-gray-50 rounded-lg">
           <h4 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h4>
           <div className="space-y-2 text-xs text-gray-600">
             <div>
               <strong>Admin:</strong> admin@example.com / admin123
             </div>
             <div>
               <strong>User:</strong> user@example.com / user123
             </div>
             <div>
               <strong>Read-Only:</strong> readonly@example.com / readonly123
             </div>
           </div>
         </div>
         </form>
      </div>
    </AuthLayout>
  )
}
export default Login;