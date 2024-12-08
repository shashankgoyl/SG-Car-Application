import React, { useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword } from 'firebase/auth';
import app from './firebase/firebase';
import swal from "sweetalert";
import { addDoc } from "firebase/firestore";
import { usersRef } from "./firebase/firebase";
import bcrypt from 'bcryptjs';

const auth = getAuth(app);

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [OTP, setOTP] = useState("");
  const [isPhoneSignup, setIsPhoneSignup] = useState(true);  // State to toggle between phone and email signup

  // Initialize reCAPTCHA
  const generateRecaptha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible', // Invisible reCAPTCHA
      callback: (response) => {
        console.log("reCAPTCHA solved");
      },
      'expired-callback': () => {
        console.log("reCAPTCHA expired");
      }
    });
  };

  // Request OTP (for phone number signup)
  const requestOtp = () => {
    if (!validatePhoneNumber(form.mobile)) return;

    setLoading(true);
    generateRecaptha(); // Call reCAPTCHA generator
    let appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, `+91${form.mobile}`, appVerifier)
      .then(confirmationResult => {
        window.confirmationResult = confirmationResult; // Store confirmationResult
        swal({
          text: "OTP Sent",
          icon: "success",
          buttons: false,
          timer: 3000,
        });
        setOtpSent(true);
        setLoading(false);
      }).catch((error) => {
        console.error("Error during OTP request:", error.message);
        swal({
          title: "Error sending OTP",
          text: error.message || "An unknown error occurred.",
          icon: "error",
          buttons: false,
          timer: 3000,
        });
        setLoading(false);
      });
  };

  // Verify OTP
  const verifyOTP = () => {
    try {
      setLoading(true);
      window.confirmationResult.confirm(OTP).then((result) => {
        uploadData();
        swal({
          text: "Successfully Registered",
          icon: "success",
          buttons: false,
          timer: 3000,
        });
        navigate('/login');
        setLoading(false);
      }).catch((error) => {
        swal({
          title: "Wrong OTP",
          text: "The OTP you entered is incorrect.",
          icon: "error",
          buttons: false,
          timer: 3000,
        });
        navigate('/signup');  // Redirect to signup if OTP is wrong
        setLoading(false);
      });
    } catch (error) {
      console.error("Error during OTP verification:", error);
      swal({
        title: "Error",
        text: error.message || "An unknown error occurred.",
        icon: "error",
        buttons: false,
        timer: 3000,
      });
      setLoading(false);
    }
  };

  // Upload user data to Firebase Firestore (for both signup types)
  const uploadData = async () => {
    try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(form.password, salt);
      await addDoc(usersRef, {
        name: form.name,
        password: hash,
        mobile: form.mobile,
        email: form.email // Save email if using email/password signup
      });
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  // Phone number validation
  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      swal({
        title: "Invalid Phone Number",
        text: "Please enter a valid 10-digit phone number.",
        icon: "error",
        buttons: false,
        timer: 3000,
      });
      return false;
    }
    return true;
  };

  // Sign up with email and password (if user opts for email signup)
  const signupWithEmail = () => {
    setLoading(true);
    createUserWithEmailAndPassword(auth, form.email, form.password)
      .then(() => {
        uploadData();
        swal({
          text: "Successfully Registered",
          icon: "success",
          buttons: false,
          timer: 3000,
        });
        navigate('/login');
        setLoading(false);
      }).catch((error) => {
        swal({
          title: "Error",
          text: error.message || "An unknown error occurred.",
          icon: "error",
          buttons: false,
          timer: 3000,
        });
        setLoading(false);
      });
  };

  return (
    <div className="w-full flex flex-col mt-8 items-center">
      <h1 className="text-xl font-bold">Sign up</h1>
      <div className="flex mb-4">
        {/* Toggle between phone number and email signup */}
        <button
          className={`py-2 px-4 rounded-l ${isPhoneSignup ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setIsPhoneSignup(true)}
        >
          Phone Number
        </button>
        <button
          className={`py-2 px-4 rounded-r ${!isPhoneSignup ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setIsPhoneSignup(false)}
        >
          Email
        </button>
      </div>

      {/* Phone Number Signup */}
      {isPhoneSignup ? (
        <>
          {otpSent ? (
            <>
              <div className="p-2 w-full md:w-1/3">
                <div className="relative">
                  <label htmlFor="otp" className="leading-7 text-sm text-gray-300">OTP</label>
                  <input
                    id="otp"
                    name="otp"
                    value={OTP}
                    onChange={(e) => setOTP(e.target.value)}
                    className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  />
                </div>
              </div>
              <div className="p-2 w-full">
                <button
                  onClick={verifyOTP}
                  className="flex mx-auto text-white bg-green-600 border-0 py-2 px-8 focus:outline-none hover:bg-green-700 rounded text-lg"
                >
                  {loading ? <TailSpin height={25} color="white" /> : "Confirm OTP"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 w-full md:w-1/3">
                <div className="relative">
                  <label htmlFor="name" className="leading-7 text-sm text-gray-300">Name</label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  />
                </div>
              </div>
              <div className="p-2 w-full md:w-1/3">
                <div className="relative">
                  <label htmlFor="mobile" className="leading-7 text-sm text-gray-300">Mobile No.</label>
                  <input
                    type="number"
                    id="mobile"
                    name="mobile"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  />
                </div>
              </div>
              <div className="p-2 w-full">
                <button
                  onClick={requestOtp}
                  className="flex mx-auto text-white bg-green-600 border-0 py-2 px-8 focus:outline-none hover:bg-green-700 rounded text-lg"
                >
                  {loading ? <TailSpin height={25} color="white" /> : "Request OTP"}
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        // Email Signup
        <>
          <div className="p-2 w-full md:w-1/3">
            <div className="relative">
              <label htmlFor="email" className="leading-7 text-sm text-gray-300">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
          </div>
          <div className="p-2 w-full md:w-1/3">
            <div className="relative">
              <label htmlFor="password" className="leading-7 text-sm text-gray-300">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
          </div>
          <div className="p-2 w-full">
            <button
              onClick={signupWithEmail}
              className="flex mx-auto text-white bg-green-600 border-0 py-2 px-8 focus:outline-none hover:bg-green-700 rounded text-lg"
            >
              {loading ? <TailSpin height={25} color="white" /> : "Sign Up with Email"}
            </button>
          </div>
        </>
      )}

      <div>
        <p>Already have an account? <Link to={'/login'}><span className="text-blue-500">Login</span></Link></p>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Signup;
