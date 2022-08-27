import "./App.css";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import titleImg from "./image/cronos_kaiju.png";
import logoImg from "./image/kaiju_logo.png";

function App() {

  const [discordUser, setDiscordUser] = useState({});
  const [discordWillShowUserName, setDiscordUserName] = useState("Invalid");
  const [discordWillShowUserImg, setDiscordUserImgURL] = useState(logoImg);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

    const fetchUsers = () => {
      fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
      })
      .then(result => result.json())
      .then(response => {
        setDiscordUser(response);
      })
      .catch(console.error);
    };

    if (accessToken) {
      fetchUsers();
    }

  }, []);

  
  useEffect(() => {

    if (discordUser !== {} && discordUser["username"] !== undefined) {
      if (discordUser["username"].length > 20) {
        const showName = discordUser["username"].slice(0, 21) + "...";
        setDiscordUserName(showName);
      } else {
        setDiscordUserName(discordUser["username"]);
      }

      setDiscordUserImgURL(`https://cdn.discordapp.com/avatars/${discordUser["id"]}/${discordUser["avatar"]}`);

      // for debug
      console.log(discordUser);
    }
  }, [discordUser]);

  const [userAddress, setUserAddr] = useState("0x0");
  const [disable, setDisableBtn] = useState(false);
  const [buttonText, setButtonText] = useState("Connect Wallet")
  const [isActive, setActiveBtn] = useState(true);

  const errToast = (msg) => toast.error(msg, {position:"bottom-left", theme:"dark", autoClose: 3000 });
  const successToast = (msg) => toast.success(msg, {position:"bottom-left", theme:"dark", autoClose: 3000 });
  const waitingToast = () => toast.loading("Connecting...", {position:"bottom-left", theme:"dark", toastId:"waitToast"});

  const connectBtnClicked = async () => {
    if (window.ethereum) {
      setDisableBtn(true);

      try {
        if (userAddress !== "0x0") {
          if (buttonText === "Connect Wallet") {
            successToast("Connected!");
            setButtonText("Disconnect Wallet");
            setActiveCard(true);
              // display user's discord name, avatar, web3 account
          } else {
            setButtonText("Connect Wallet");
            setActiveCard(false);
          }
          
          setDisableBtn(false);
          return;
        }

        // Handling when the user refuses to approve and then immediately clicks the connect button.
        if (!toast.isActive("waitToast")) {
          waitingToast();
        } else {
          toast.update("waitToast", { render: "connecting", type: "default", isLoading: true });
        }

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const account = accounts[0];

        if (account) {
          setButtonText("Disconnect Wallet");
          setUserAddr(account);
          toast.dismiss("waitToast");
          successToast("Connected!");
          setActiveCard(true);
        }

      } catch (error) {
          const err = error["message"]

          if (toast.isActive("waitToast")) {
            toast.update("waitToast", { render: err, type: "error", isLoading: false, autoClose: 3000 });
          } else {
            errToast(err);
        }

      }
        
    } else {
        errToast("You don't have any web3 wallet.");
        console.error("You don't have any web3 wallet.");
    }

    setDisableBtn(false);
  }

  // Handling user accountsChanged/disconnect
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async () => {
        setUserAddr("0x0");
        setButtonText("Connect Wallet");
        setActiveCard(false);
      });

      const accountWasChanged = () => {
        setUserAddr("0x0");
      }

      return () => {
        window.ethereum.removeListener('accountsChanged', accountWasChanged);
      }
    }
  }, []);

  // Ask for verification from the back-end and get result message
  const [verifiedStatus, setVerifiedStatus] = useState("Not Verified");

  useEffect(() => {
      
      if (userAddress !== "0x0") {
        let success = false;

        // call api
        // get response

        // for debug:simulate a verification process
        
        success = true;
        
        if (success) {
          setVerifiedStatus("Verified");
          successToast("Verified!! You will get verified role(s) as soon as possible.");
        } else {
          setVerifiedStatus("Not Verified");
          errToast("You don't have the NFT(s) we set!");
        }

      }

      // for debug
      console.log(userAddress);

  }, [userAddress]);

  const [showProfileCard, setActiveCard] = useState(false);

  return (
    <div className="Cronos-Kaiju">
      <div className="Verify-Page-bg">
        <div className="Verify-Page-rain bg-center w-full h-[100vh] flex flex-col gap-20 justify-center items-center">
          <img className="block" src={titleImg} alt="title" />

          {/*Profile info card*/}
          <div className={`${showProfileCard ? "flex" : "hidden"} flex-col md:flex-row justify-center items-center z-10 bg-gray-800 rounded-lg border-4 border-double border-purple-400 ring-offset-2 ring-2 ring-purple-200/50`}>
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-5 md:gap-12 px-12 md:px-8 py-3 leading-normal">
              <div className="rounded-lg ring-2 ring-purple-400/60 ring-offset-2">
                <img className="rounded-lg w-32 h-32 md:w-40 md:h-40" src={discordWillShowUserImg} alt=""/>
              </div>
              <div>
                <p className="mb-3 lg:mb-6 text-center text-xl lg:text-3xl font-bold tracking-tight text-white">{discordWillShowUserName}</p>
                <p className="mb-3 text-center font-normal lg:text-2xl text-white">{userAddress.slice(0, 4) + "..." + userAddress.slice(-4)}</p>
              </div>
              <div className="rounded-lg ring-2 ring-purple-400/60 ring-offset-1 ring-offset-white/80 md:self-start">
                <p className="px-5 py-2 md:py-1 text-center font-bold text-pink-500">{verifiedStatus}</p>
              </div>
            </div>
          </div>

          {/*Main button*/}
          <button onMouseEnter={() => setActiveBtn(false)} onMouseLeave={() => setActiveBtn(true)} disabled={disable} onClick={connectBtnClicked} id="connectBtn" 
          className={`${isActive ? "animate-pulse" : ''} z-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 p-1 duration-75 active:translate-y-1 active:shadow-xl active:shadow-indigo-300/50`}>

            <div className="flex items-center">
              <svg className="ml-1 mr-1 w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 332" >
              <path d="m126.613 93.9842c62.622-61.3123 164.152-61.3123 226.775 0l7.536 7.3788c3.131 3.066 3.131 8.036 0 11.102l-25.781 25.242c-1.566 1.533-4.104 1.533-5.67 0l-10.371-10.154c-43.687-42.7734-114.517-42.7734-158.204 0l-11.107 10.874c-1.565 1.533-4.103 1.533-5.669 0l-25.781-25.242c-3.132-3.066-3.132-8.036 0-11.102zm280.093 52.2038 22.946 22.465c3.131 3.066 3.131 8.036 0 11.102l-103.463 101.301c-3.131 3.065-8.208 3.065-11.339 0l-73.432-71.896c-.783-.767-2.052-.767-2.835 0l-73.43 71.896c-3.131 3.065-8.208 3.065-11.339 0l-103.4657-101.302c-3.1311-3.066-3.1311-8.036 0-11.102l22.9456-22.466c3.1311-3.065 8.2077-3.065 11.3388 0l73.4333 71.897c.782.767 2.051.767 2.834 0l73.429-71.897c3.131-3.065 8.208-3.065 11.339 0l73.433 71.897c.783.767 2.052.767 2.835 0l73.431-71.895c3.132-3.066 8.208-3.066 11.339 0z"/>
              </svg>
              <div className="rounded-lg bg-black py-4 px-3 text-white hover:bg-transparent hover:text-black">
                <span className="font-mono text-lg font-semibold">
                  {buttonText}
                </span>
              </div>
            </div>
          </button>

          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default App;