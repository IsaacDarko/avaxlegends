import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { ABI, ADDRESS } from '../contract';
import { useNavigate } from 'react-router-dom';
import { createEventListeners } from './createEventListeners';
import { GetParams } from '../utils/onboard';

const GlobalContext = createContext();


export const GlobalContextProvider = ({ children }) => {
    const player1Ref = useRef();
    const player2Ref = useRef();
    const [step, setStep] = useState(1);
    const [provider, setProvider] = useState('');
    const [contract, setContract] = useState('');
    const [battleName, setBattleName] = useState('');
    const [roundEnded, setRoundEnded] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [battleEnded, setBattleEnded] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [updateGameData, setUpdateGameData] = useState(0);
    const [summonedPlayer, setSummonedPlayer] = useState('');
    const [battleGround, setBattleGround] = useState('bg-astral');
    const [accountConnected, setAccountConnected] = useState(false);

    const [showAlert, setShowAlert] = useState({ status: false, type: 'info', message: '' });
    const [gameData, setGameData] = useState({ player:[], pendingBattles:[], activeBattle: null });

    

    const navigate = useNavigate();

    //* Set battleground to local storage
    useEffect(() => {
        const isBattleground = localStorage.getItem('battleground');

        if (isBattleground) {
        setBattleGround(isBattleground);
        } else {
        localStorage.setItem('battleground', battleGround);
        }
    }, []);




    //Reset onboarding params for unprepared players
    useEffect(() => {
        const resetParams = async () => {
            const currentStep = await GetParams();
            setStep(currentStep.step);
        };

        resetParams();
        window?.ethereum?.on('chainChanged', () => resetParams())
        window?.ethereum?.on('accountsChanged', () => resetParams())
    }, [])





    //update the current wallet address
    const updateCurrentWalletAddress = async () => {
        try{
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            })
            if(accounts) {
                console.log(accounts);
                const currentAccount = accounts[0];
                localStorage.removeItem('walletAddress');
                localStorage.setItem('walletAddress', currentAccount);
                setWalletAddress(currentAccount);
                setAccountConnected(true);          
            }else{
                const wallet = localStorage.getItem('walletAddress');
                console.log(wallet)
                setWalletAddress(wallet)
            } 
        }catch(error){
            console.log(error);
        }
    };



    const checkWallet = () => {
        if(contract !== '') setAccountConnected(true)
    }



    const endGame = (name) => {
        const battleName = name;
        const endedBattle = gameData.activeBattle.filter((battle) => battle.name === battleName);
        console.log(endedBattle);
        setGameData({
            activeBattle: endedBattle
        })
    }



    //this useEffect sets up the providers and then gets smart-contract(using web3modal, ethers, and backend abi) then sets them to state
    useEffect(() => {
        const setSmartContractAndProvider = async () =>{
            try{
                const web3modal = new Web3Modal();
                const connection = await web3modal.connect();
                const newProvider = new ethers.providers.Web3Provider(connection);
                const signer = newProvider.getSigner();
                const newContract =  new ethers.Contract(ADDRESS, ABI, signer);
                console.log(newContract);
                setContract(newContract);
                setProvider(newProvider);
            }catch(error){
                console.log(error);
            }
        }
        setSmartContractAndProvider();
    }, []);



   //this useEffect runs on initial load and whenever accounts change, it ensures users are logged in by running the updateCurrentWalletAddress function
    useEffect(() => {
        updateCurrentWalletAddress();
        //window?.ethereum?.on('accountsChanged', updateCurrentWalletAddress)
    }, []);



    useEffect(() => {
        if( step !== -1 && contract){        
            createEventListeners({ 
                setBattleName,
                summonedPlayer, 
                setSummonedPlayer, 
                navigate,
                setRoundEnded,
                contract, 
                provider, 
                setWalletAddress, 
                walletAddress, 
                setShowAlert, 
                setUpdateGameData,
                player1Ref,
                player2Ref,
                setBattleEnded,
                setGameData
            });
        }
    }, [contract]);



    useEffect(() =>{
        if(showAlert?.status){
            const timer = setTimeout(() => {
                setShowAlert({
                    status: false,
                    type: 'info',
                    message: ''
                })
            },[4000])
            return () => clearTimeout(timer)
        }
    }, [showAlert]);



    useEffect(() => {
        if(errorMessage){
            const parsedErrorMessage = errorMessage?.reason?.slice('execution reverted: '.length).slice(0, -1);
            if(parsedErrorMessage){
                setShowAlert({
                    status: true,
                    type: 'failure',
                    message: parsedErrorMessage
                });
            }
        }
        
    }, [errorMessage])



    //set game data to state
    useEffect(() =>{
        console.log('populating game data')
        const wallet = localStorage.getItem('walletAddress');

        const fetchGameData = async () =>{
            if(contract){
                const fetchedBattles = await contract.getAllBattles();
                const pendingBattles = fetchedBattles.filter((battle) => battle.battleStatus === 0);
                let activeBattle = null
                console.log(wallet)
                fetchedBattles.forEach((battle) => { 
                    if(battle.players.find((player) => player.toLowerCase() === wallet.toLowerCase())){
                        if(battle.winner.startsWith('0x00')){
                            activeBattle = battle
                        }
                    }
                })
                setGameData({
                    pendingBattles: pendingBattles.slice(1),
                    activeBattle: activeBattle
                })
            }
        }

        fetchGameData();
    }, [contract, battleEnded])



    return(
        <GlobalContext.Provider value={{
            contract, provider, 
            updateCurrentWalletAddress,
            accountConnected, checkWallet,
            walletAddress, setWalletAddress, 
            summonedPlayer, setSummonedPlayer, 
            gameData, setGameData,
            battleName, setBattleName, 
            updateGameData, setUpdateGameData,
            battleGround, setBattleGround, 
            showAlert, setShowAlert, 
            errorMessage, setErrorMessage, 
            player1Ref, player2Ref,
             demo:'test',setRoundEnded,
             battleEnded, setBattleEnded
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext);