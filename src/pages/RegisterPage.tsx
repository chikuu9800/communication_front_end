// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Mail, Lock, User, ArrowRight } from 'lucide-react';
// import Button from '../components/ui/Button';
// import { useAuth } from '../contexts/AuthContext';


// const RegisterPage = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const { register } = useAuth();

//   const handleSubmit = async(e: React.FormEvent) => {
//     e.preventDefault();
//     // Add registration logic here
//     try {
//       await register(name, email, password);
//       navigate('/');
//     } catch (err) {
//       console.error(err);
//       // Optional: show error to user
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Create your account
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Already have an account?{' '}
//             <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
//               Sign in
//             </Link>
//           </p>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="rounded-md shadow-sm space-y-4">
//             <div>
//               <label htmlFor="name" className="sr-only">
//                 Full name
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="name"
//                   name="name"
//                   type="text"
//                   required
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
//                   placeholder="Full name"
//                 />
//               </div>
//             </div>
//             <div>
//               <label htmlFor="email" className="sr-only">
//                 Email address
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
//                   placeholder="Email address"
//                 />
//               </div>
//             </div>
//             <div>
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   autoComplete="new-password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
//                   placeholder="Password"
//                 />
//               </div>
//             </div>
//           </div>

//           <div>
//             <Button
//               type="submit"
//               className="group relative w-full flex justify-center py-2 px-4"
//               rightIcon={<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
//             >
//               Create account
//             </Button>
//           </div>

//           <p className="mt-2 text-center text-sm text-gray-600">
//             By signing up, you agree to our{' '}
//             <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-500">
//               Terms of Service
//             </Link>{' '}
//             and{' '}
//             <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
//               Privacy Policy
//             </Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;



import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError('Registration failed. Try a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Create your account
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-500 hover:text-blue-600"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 text-gray-900 rounded-xl border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 text-gray-900 rounded-xl border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 text-gray-900 rounded-xl border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow sm:text-sm"
                    placeholder="Create a password"
                  />
                </div>
              </div>
            </div>

            {/* Button */}
            <div>
              <Button
                type="submit"
                className="w-full py-3 text-base font-medium rounded-xl group bg-[#06402B] text-white"
                rightIcon={
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                }
                isLoading={isLoading}
                disabled={isLoading}
              >
                Create account
              </Button>
            </div>

            {/* Footer Links */}
            <p className="text-center text-sm text-gray-600">
              By signing up, you agree to our
              <Link to="/terms" className="font-medium text-blue-500 hover:text-blue-600">
               {' '} Terms of Service {' '}
              </Link>
              and
              <Link to="/privacy" className="font-medium text-blue-500 hover:text-blue-600">
                {' '} Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-700">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <img
          src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
          alt="Team"
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay"
        />

        <div className="absolute inset-0 flex items-center justify-center p-12">
          <blockquote className="max-w-lg">
            <p className="text-2xl font-medium text-white">
              "Start collaborating smarter. Join the platform that empowers teams to do more together."
            </p>
            <footer className="mt-6">
              <p className="text-base font-medium text-white">Daniel Carter</p>
              <p className="text-sm text-white/80">CTO at TechFlow</p>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
