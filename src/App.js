import "./App.css";
import title from "./cronos_kaiju.png";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  const [discordUser, setDiscordUser] = useState({});

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
    if (discordUser !== {}) {
        // discordUserAvatar = `https://cdn.discordapp.com/avatars/${discordUser["id"]}/${discordUser["avatar"]}`
        console.log(discordUser)
    }
  }, [discordUser]);

  const [UserAddress, setUserAddr] = useState("0x0");
  const [disable, setDisableBtn] = useState(false);
  const [ButtonText, setButtonText] = useState("Connect Wallet")

  var errToast = (msg) => toast.error(msg, {position:"bottom-left", theme:"dark", autoClose: 3000 });
  var successToast = (msg) => toast.success(msg, {position:"bottom-left", theme:"dark", autoClose: 3000 });
  var waitingToast = () => toast.loading("Connecting...", {position:"bottom-left", theme:"dark", toastId:"waitToast"});

  const connectBtnClicked = async () => {
      if (window.ethereum) {
          try {

              if (UserAddress !== "0x0") {
                  if (ButtonText === "Connect Wallet") {
                      setButtonText("Disconnect Wallet");
                      // display user's discord name, avatar, web3 account
                  }
                  else {
                      setButtonText("Connect Wallet");
                  }

                  return;
              }

              setDisableBtn(true);

              // Handling when the user refuses to approve and then immediately clicks the connect button.
              if (!toast.isActive("waitToast")) {
                  waitingToast();
              } else {
                  toast.update("waitToast", { render: "connecting", type: "default", isLoading: true });
              }

              const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
              const account = accounts[0];
      
              if (account) {
                  setUserAddr(account);
                  toast.update("waitToast", { render: "Connected!", type: "success", isLoading: false, autoClose: 3000 });
              }
                  
          } catch (error) {
              const err = error["message"]

              if (toast.isActive("waitToast")) {
                  toast.update("waitToast", { render: err, type: "error", isLoading: false, autoClose: 3000 });
              } else {
                  errToast(err);
              }

          } finally {
              setDisableBtn(false);
          }
          
      } else {
            errToast("You don't have any web3 wallet.")
            console.error("You don't have any web3 wallet.");
      } 
  }

  window.ethereum.on('accountsChanged', async () => {
    setUserAddr("0x0");
    setButtonText("Connect Wallet");
  });

  useEffect(() => {
      
      if (UserAddress !== "0x0") {
          setButtonText("Disconnect Wallet");
          // show card
          // call api
          // get response

          // if success:
          //    successToast("Verified!! You will get verified role(s) as soon as possible!")
          // else:
          //    errToast("You don't have the NFT(s) we set!")
      }

      console.log(UserAddress)
      
  }, [UserAddress]);

  return (
    <div className="Cronos-Kaiju">
      <div className="Verify-Page-bg bg-center w-full h-[100vh] flex flex-col gap-40 justify-center items-center">
        <div className="Verify-Page-rain bg-center w-full h-[100vh] flex flex-col gap-40 justify-center items-center">
          <img src={title} alt="title" />
          <button disabled={disable} id="connectBtn" className="relative inline-flex items-center justify-center h-16 p-1 mb-2 mr-2 overflow-hidden sm:text-xl font-mono font-medium 
          rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 
          shadow hover:shadow-lg focus:ring-4 focus:outline-none focus:ring-blue-300 active:translate-y-1" 
          type="button" onClick={connectBtnClicked}>
          
            <svg aria-hidden="true" className="ml-1 mr-1 w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 332" >
              <path d="m126.613 93.9842c62.622-61.3123 164.152-61.3123 226.775 0l7.536 7.3788c3.131 3.066 3.131 8.036 0 11.102l-25.781 25.242c-1.566 1.533-4.104 1.533-5.67 0l-10.371-10.154c-43.687-42.7734-114.517-42.7734-158.204 0l-11.107 10.874c-1.565 1.533-4.103 1.533-5.669 0l-25.781-25.242c-3.132-3.066-3.132-8.036 0-11.102zm280.093 52.2038 22.946 22.465c3.131 3.066 3.131 8.036 0 11.102l-103.463 101.301c-3.131 3.065-8.208 3.065-11.339 0l-73.432-71.896c-.783-.767-2.052-.767-2.835 0l-73.43 71.896c-3.131 3.065-8.208 3.065-11.339 0l-103.4657-101.302c-3.1311-3.066-3.1311-8.036 0-11.102l22.9456-22.466c3.1311-3.065 8.2077-3.065 11.3388 0l73.4333 71.897c.782.767 2.051.767 2.834 0l73.429-71.897c3.131-3.065 8.208-3.065 11.339 0l73.433 71.897c.783.767 2.052.767 2.835 0l73.431-71.895c3.132-3.066 8.208-3.066 11.339 0z"/>
            </svg>
            <span className="relative h-14 px-3 py-4 dark:bg-gray-900 dark:text-white bg-gray-900 text-white hover:text-gray-900 hover:font-semibold transition-all ease-in duration-75 rounded-md group-hover:bg-opacity-0">
              {ButtonText}
            </span>
          </button>

          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default App;