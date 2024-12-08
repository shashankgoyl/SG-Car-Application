import React, { useContext, useState } from "react";
import { TailSpin } from "react-loader-spinner";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Appstate } from "../App";
import { query, where, getDocs } from "firebase/firestore";
import { usersRef } from "./firebase/firebase"; // Ensure your usersRef is pointing to the correct collection.
import swal from "sweetalert";
import bcrypt from "bcryptjs";

const auth = getAuth();

const Login = () => {
  const navigate = useNavigate();
  const useAppstate = useContext(Appstate);
  const [form, setForm] = useState({
    mobile: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(true); // Toggle between phone and email login

  // Initialize reCAPTCHA
  const generateRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response) => {
        console.log("reCAPTCHA solved");
      },
      'expired-callback': () => {
        console.log("reCAPTCHA expired");
      }
    });
  };

  // Request OTP for phone login
  const requestOtp = () => {
    if (!validatePhoneNumber(form.mobile)) return;

    setLoading(true);
    generateRecaptcha();
    let appVerifier = window.recaptchaVerifier;

    signInWithPhoneNumber(auth, `+91${form.mobile}`, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        swal({
          text: "OTP Sent",
          icon: "success",
          buttons: false,
          timer: 3000,
        });
        setLoading(false);
      })
      .catch((error) => {
        swal({
          title: "Error",
          text: error.message,
          icon: "error",
          buttons: false,
          timer: 3000,
        });
        setLoading(false);
      });
  };

  // Verify OTP for phone login
  const verifyOtp = (otp) => {
    setLoading(true);
    window.confirmationResult.confirm(otp)
      .then((result) => {
        // Proceed to the main app after successful login
        useAppstate.setLogin(true);
        useAppstate.setUserName(result.user.displayName);
        swal({
          title: "Logged In",
          icon: "success",
          buttons: false,
          timer: 3000,
        });
        navigate("/");
        setLoading(false);
      })
      .catch((error) => {
        swal({
          title: "Invalid OTP",
          icon: "error",
          buttons: false,
          timer: 3000,
        });
        setLoading(false);
      });
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

  // Handle email/password login
  const loginWithEmail = async () => {
    setLoading(true);
    try {
      const user = await signInWithEmailAndPassword(auth, form.email, form.password);
      useAppstate.setLogin(true);
      useAppstate.setUserName(user.user.displayName || form.email); // Set display name or email
      swal({
        title: "Logged In",
        icon: "success",
        buttons: false,
        timer: 3000,
      });
      navigate("/");
    } catch (error) {
      swal({
        title: "Invalid Credentials",
        icon: "error",
        buttons: false,
        timer: 3000,
      });
    }
    setLoading(false);
  };

  // Handle login with mobile
  const loginWithPhone = async () => {
    setLoading(true);
    const quer = query(usersRef, where("mobile", "==", form.mobile));
    const querySnapshot = await getDocs(quer);

    if (querySnapshot.empty) {
      swal({
        title: "No user found with this mobile number",
        icon: "error",
        buttons: false,
        timer: 3000,
      });
      setLoading(false);
      return;
    }

    querySnapshot.forEach((doc) => {
      const _data = doc.data();
      const isUser = bcrypt.compareSync(form.password, _data.password);

      if (isUser) {
        useAppstate.setLogin(true);
        useAppstate.setUserName(_data.name);
        swal({
          title: "Logged In",
          icon: "success",
          buttons: false,
          timer: 3000,
        });
        navigate("/");
      } else {
        swal({
          title: "Invalid Credentials",
          icon: "error",
          buttons: false,
          timer: 3000,
        });
      }
    });
    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col mt-8 items-center">
      <h1 className="text-xl font-bold">Login</h1>
      
      {/* Toggle between Phone and Email login */}
      <div className="flex mb-4">
        <button
          className={`py-2 px-4 rounded-l ${isPhoneLogin ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setIsPhoneLogin(true)}
        >
          Phone Number
        </button>
        <button
          className={`py-2 px-4 rounded-r ${!isPhoneLogin ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setIsPhoneLogin(false)}
        >
          Email
        </button>
      </div>

      {/* Phone Number Login */}
      {isPhoneLogin ? (
        <>
          <div className="p-2 w-full md:w-1/3">
            <div className="relative">
              <label htmlFor="mobile" className="leading-7 text-sm text-gray-300">Mobile No.</label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
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
              onClick={loginWithPhone}
              className="flex mx-auto text-white bg-green-600 border-0 py-2 px-8 focus:outline-none hover:bg-green-700 rounded text-lg"
            >
              {loading ? <TailSpin height={25} color="white" /> : "Login with Phone"}
            </button>
          </div>
          <div className="p-2 w-full">
            <button
              onClick={requestOtp}
              className="flex mx-auto text-white bg-blue-600 border-0 py-2 px-8 focus:outline-none hover:bg-blue-700 rounded text-lg"
            >
              {loading ? <TailSpin height={25} color="white" /> : "Request OTP"}
            </button>
          </div>
        </>
      ) : (
        // Email Login
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
              onClick={loginWithEmail}
              className="flex mx-auto text-white bg-green-600 border-0 py-2 px-8 focus:outline-none hover:bg-green-700 rounded text-lg"
            >
              {loading ? <TailSpin height={25} color="white" /> : "Login with Email"}
            </button>
          </div>
        </>
      )}

      <div>
        <p>
          Do not have an account?{" "}
          <Link to={"/signup"}>
            <span className="text-blue-500">Sign Up</span>
          </Link>
        </p>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;
