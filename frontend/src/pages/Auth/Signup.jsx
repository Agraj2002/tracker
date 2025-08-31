import React, { useState, useCallback, useEffect } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Signup = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { signup, loading, error, isAuthenticated, clearError } = useAuth();

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
    if (fullName || email || password || confirmPassword) {
      setLocalError(null);
      clearError();
    }
  }, [fullName, email, password, confirmPassword, clearError]);

  //Handle Sign Up form Submit with useCallback for optimization
  const handleSignUp = useCallback(async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!fullName.trim()) {
      setLocalError("Please enter your full name");
      return;
    }
    
    if (!validateEmail(email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }
    
    if (!password) {
      setLocalError("Please enter the password");
      return;
    }
    
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    
    setLocalError("");

    // Prepare signup data
    const signupData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'user' // Default role
    };

    // Include profile image if selected
    if (profilePic) {
      signupData.profileImage = profilePic;
    }

    // SignUp API Call
    const result = await signup(signupData);
    
    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [fullName, email, password, confirmPassword, profilePic, signup, navigate, location]);

  const displayError = localError || error;
  return (
    <AuthLayout>
     <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
      <h3 className='text-xl font-semibold text-black'>Create An Account</h3>
      <p className='text-xs text-slate-700 mt-[5px] mb-6'>Join us today by entering your details below.</p>

      <form onSubmit={handleSignUp}>
         
         <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} disabled={loading} />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input
           value={fullName}
           onChange={({target})=>setFullName(target.value)}
           label="Full Name"
           placeholder="John Doe"
           type="text"
           disabled={loading}
           />

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
         
         <Input
         value={confirmPassword}
         onChange={({target})=>setConfirmPassword(target.value)}
         label="Confirm Password"
         placeholder="Confirm your password"
         type="password"
         disabled={loading}
         />
        </div>

        {displayError && <p className='text-red-500 text-xs pb-2.5'>{displayError}</p>}
        
        <button 
          type='submit' 
          className='btn-primary flex items-center justify-center'
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Creating account...</span>
            </>
          ) : (
            'SIGN UP'
          )}
        </button>
        
        <p className='text-[13px] text-slate-800 mt-3'>Already have an account?{" "}
          <Link className="font-medium text-primary underline" to="/login">
           Login
          </Link>
        </p>
      </form>
     </div>
    </AuthLayout>
  )
}

export default Signup;