"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
require("./App.css");
const react_1 = require("react");
const react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.css");
const cronos_kaiju_png_1 = __importDefault(require("./image/cronos_kaiju.png"));
const kaiju_logo_png_1 = __importDefault(require("./image/kaiju_logo.png"));
function App() {
    const [discordUser, setDiscordUser] = (0, react_1.useState)({
        id: "",
        username: "",
        avatar: "",
        avatar_decoration: null,
        discriminator: "",
        public_flags: 0,
        flags: 0,
        banner: "",
        banner_color: "",
        accent_color: 0,
        locale: "",
        mfa_enabled: false,
        premium_type: 0,
    });
    const [discordWillShowUserName, setDiscordUserName] = (0, react_1.useState)("Invalid");
    const [discordWillShowUserImg, setDiscordUserImgURL] = (0, react_1.useState)(kaiju_logo_png_1.default);
    // Get and set discord user info
    (0, react_1.useEffect)(() => {
        const fragment = new URLSearchParams(window.location.hash.slice(1));
        const [accessToken, tokenType] = [
            fragment.get("access_token"),
            fragment.get("token_type"),
        ];
        const fetchUsers = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield fetch("https://discord.com/api/users/@me", {
                    headers: {
                        authorization: `${tokenType} ${accessToken}`,
                    },
                });
                const response = yield result.json();
                setDiscordUser(response);
            }
            catch (error) {
                console.log(error);
            }
        });
        if (accessToken) {
            fetchUsers();
        }
    }, []);
    // Set the discord user info that will be displayed
    (0, react_1.useEffect)(() => {
        if (discordUser["username"] !== "") {
            if (discordUser["username"].length > 20) {
                const showName = discordUser["username"].slice(0, 21) + "...";
                setDiscordUserName(showName);
            }
            else {
                setDiscordUserName(discordUser["username"]);
            }
            setDiscordUserImgURL(`https://cdn.discordapp.com/avatars/${discordUser["id"]}/${discordUser["avatar"]}`);
            // for debug
            console.log(discordUser);
        }
    }, [discordUser]);
    const [userAddress, setUserAddr] = (0, react_1.useState)("0x0");
    const [disable, setDisableBtn] = (0, react_1.useState)(false);
    const [buttonText, setButtonText] = (0, react_1.useState)("Connect Wallet");
    const [isActive, setActiveBtn] = (0, react_1.useState)(true);
    const errToast = (msg) => react_toastify_1.toast.error(msg, {
        position: "bottom-left",
        theme: "dark",
        autoClose: 3000,
    });
    const successToast = (msg) => react_toastify_1.toast.success(msg, {
        position: "bottom-left",
        theme: "dark",
        autoClose: 3000,
    });
    const waitingToast = () => react_toastify_1.toast.loading("Connecting...", {
        position: "bottom-left",
        theme: "dark",
        toastId: "waitToast",
    });
    const connectBtnClicked = () => __awaiter(this, void 0, void 0, function* () {
        if (window.ethereum) {
            setDisableBtn(true);
            try {
                if (userAddress !== "0x0") {
                    if (buttonText === "Connect Wallet") {
                        successToast("Connected!");
                        setButtonText("Disconnect Wallet");
                        setActiveCard(true);
                    }
                    else {
                        setButtonText("Connect Wallet");
                        setActiveCard(false);
                    }
                    setDisableBtn(false);
                    return;
                }
                // Handling when the user refuses to approve and then immediately clicks the connect button.
                if (!react_toastify_1.toast.isActive("waitToast")) {
                    waitingToast();
                }
                else {
                    react_toastify_1.toast.update("waitToast", {
                        render: "connecting",
                        type: "default",
                        isLoading: true,
                    });
                }
                const accounts = yield window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                const account = accounts[0];
                if (account) {
                    setButtonText("Disconnect Wallet");
                    setUserAddr(account);
                    react_toastify_1.toast.dismiss("waitToast");
                    successToast("Connected!");
                    setActiveCard(true);
                }
            }
            catch (error) {
                const err = error.message;
                if (react_toastify_1.toast.isActive("waitToast")) {
                    react_toastify_1.toast.update("waitToast", {
                        render: err,
                        type: "error",
                        isLoading: false,
                        autoClose: 3000,
                    });
                }
                else {
                    errToast(err);
                }
            }
        }
        else {
            errToast("You don't have any web3 wallet.");
            console.error("You don't have any web3 wallet.");
        }
        setDisableBtn(false);
    });
    // Handling user accountsChanged/disconnect
    (0, react_1.useEffect)(() => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", () => __awaiter(this, void 0, void 0, function* () {
                setUserAddr("0x0");
                setButtonText("Connect Wallet");
                setActiveCard(false);
            }));
            const accountWasChanged = () => {
                setUserAddr("0x0");
            };
            return () => {
                window.ethereum.removeListener("accountsChanged", accountWasChanged);
            };
        }
    }, []);
    // Ask for verification from the back-end and get result message
    const [verifiedStatus, setVerifiedStatus] = (0, react_1.useState)("Not Verified");
    (0, react_1.useEffect)(() => {
        if (userAddress !== "0x0") {
            let success = false;
            // call api
            // get response
            // for debug:simulate a verification process
            success = true;
            if (success) {
                setVerifiedStatus("Verified");
                successToast("Verified!! You will get verified role(s) as soon as possible.");
            }
            else {
                setVerifiedStatus("Not Verified");
                errToast("You don't have the NFT(s) we set!");
            }
        }
        // for debug
        console.log(userAddress);
    }, [userAddress]);
    const [showProfileCard, setActiveCard] = (0, react_1.useState)(false);
    return ((0, jsx_runtime_1.jsx)("div", Object.assign({ className: "Cronos-Kaiju" }, { children: (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "Verify-Page-bg" }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "Verify-Page-rain bg-center w-full h-[100vh] flex flex-col gap-20 justify-center items-center" }, { children: [(0, jsx_runtime_1.jsx)("img", { className: "inline-block", src: cronos_kaiju_png_1.default, alt: "title" }), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: `${showProfileCard ? "flex" : "hidden"} flex-col md:flex-row justify-center items-center z-10 bg-gray-800 rounded-lg border-4 border-double border-purple-400 ring-offset-2 ring-2 ring-purple-200/50` }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "flex flex-col md:flex-row justify-center md:justify-between items-center gap-5 md:gap-12 px-12 md:px-8 py-3 leading-normal" }, { children: [(0, jsx_runtime_1.jsx)("div", Object.assign({ className: "rounded-lg ring-2 ring-purple-400/60 ring-offset-2" }, { children: (0, jsx_runtime_1.jsx)("img", { className: "rounded-lg w-32 h-32 md:w-40 md:h-40", src: discordWillShowUserImg, alt: "" }) })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", Object.assign({ className: "mb-3 lg:mb-6 text-center text-xl lg:text-3xl font-bold tracking-tight text-white" }, { children: discordWillShowUserName })), (0, jsx_runtime_1.jsx)("p", Object.assign({ className: "mb-3 text-center font-normal lg:text-2xl text-white" }, { children: userAddress.slice(0, 4) + "..." + userAddress.slice(-4) }))] }), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "rounded-lg ring-2 ring-purple-400/60 ring-offset-1 ring-offset-white/80 md:self-start" }, { children: (0, jsx_runtime_1.jsx)("p", Object.assign({ className: "px-5 py-2 md:py-1 text-center font-bold text-pink-500" }, { children: verifiedStatus })) }))] })) })), (0, jsx_runtime_1.jsx)("button", Object.assign({ onMouseEnter: () => setActiveBtn(false), onMouseLeave: () => setActiveBtn(true), disabled: disable, onClick: connectBtnClicked, id: "connectBtn", className: `${isActive ? "animate-pulse" : ""} z-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 p-1 duration-75 active:translate-y-1 active:shadow-xl active:shadow-indigo-300/50` }, { children: (0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "flex items-center" }, { children: [(0, jsx_runtime_1.jsx)("svg", Object.assign({ className: "ml-1 mr-1 w-10 h-10", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 480 332" }, { children: (0, jsx_runtime_1.jsx)("path", { d: "m126.613 93.9842c62.622-61.3123 164.152-61.3123 226.775 0l7.536 7.3788c3.131 3.066 3.131 8.036 0 11.102l-25.781 25.242c-1.566 1.533-4.104 1.533-5.67 0l-10.371-10.154c-43.687-42.7734-114.517-42.7734-158.204 0l-11.107 10.874c-1.565 1.533-4.103 1.533-5.669 0l-25.781-25.242c-3.132-3.066-3.132-8.036 0-11.102zm280.093 52.2038 22.946 22.465c3.131 3.066 3.131 8.036 0 11.102l-103.463 101.301c-3.131 3.065-8.208 3.065-11.339 0l-73.432-71.896c-.783-.767-2.052-.767-2.835 0l-73.43 71.896c-3.131 3.065-8.208 3.065-11.339 0l-103.4657-101.302c-3.1311-3.066-3.1311-8.036 0-11.102l22.9456-22.466c3.1311-3.065 8.2077-3.065 11.3388 0l73.4333 71.897c.782.767 2.051.767 2.834 0l73.429-71.897c3.131-3.065 8.208-3.065 11.339 0l73.433 71.897c.783.767 2.052.767 2.835 0l73.431-71.895c3.132-3.066 8.208-3.066 11.339 0z" }) })), (0, jsx_runtime_1.jsx)("div", Object.assign({ className: "rounded-lg bg-black py-4 px-3 text-white hover:bg-transparent hover:text-black" }, { children: (0, jsx_runtime_1.jsx)("span", Object.assign({ className: "font-mono text-lg font-semibold" }, { children: buttonText })) }))] })) })), (0, jsx_runtime_1.jsx)(react_toastify_1.ToastContainer, {})] })) })) })));
}
exports.default = App;
