import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { ABI, ADDRESS } from '../contract';
import { useNavigate } from 'react-router-dom';
import { createEventListeners } from './createEventListeners';

const GlobalContext = createContext();


export const GlobalContextProvider = ({ children }) => {
    const [provider, setProvider] = useState('');
    const [contract, setContract] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [accountConnected, setAccountConnected] = useState(false);
    const [summonedPlayer, setSummonedPlayer] = useState('')
    const [battleName, setBattleName] = useState('');
    const [showAlert, setShowAlert] = useState({ status: false, type: 'info', message: '' });
    const [gameData, setGameData] = useState({ player:[], pendingBattles:[], activeBattle: null });
    const [updateGameData, setUpdateGameData] = useState(0);
    const [battleGround, setBattleGround] = useState('bg-astral')

    

    const navigate = useNavigate();

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
            } 
        }catch(error){
            console.log(error);
        }
    };



    const checkWallet = () => {
        if(contract !== '') setAccountConnected(true)
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
        window?.ethereum?.on('accountsChanged', updateCurrentWalletAddress)
    }, []);



    useEffect(() => {
        if(contract){        
            createEventListeners({ summonedPlayer, setSummonedPlayer, navigate, contract, provider, walletAddress, setShowAlert, setUpdateGameData });
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
            },[5000])
            return () => clearTimeout(timer)
        }
    }, [showAlert]);



    //set game data to state
    useEffect(() =>{
        const wallet = localStorage.getItem('walletAddress');
        setWalletAddress(wallet);
        const fetchGameData = async () =>{
            if(contract){
                const fetchedBattles = await contract.getAllBattles();
                const pendingBattles = fetchedBattles.filter((battle) => battle.battleStatus === 0);
                let activeBattle = null
                console.log(walletAddress)
                fetchedBattles.forEach((battle) => { 
                    if(battle.players.find((player) => player.toLowerCase() === walletAddress.toLowerCase())){
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
    }, [contract])



    return(
        <GlobalContext.Provider value={{
            contract, provider, updateCurrentWalletAddress,
            walletAddress, accountConnected, checkWallet,
            setWalletAddress, summonedPlayer, setSummonedPlayer, 
            gameData, battleName, setBattleName, updateGameData,
            battleGround, setBattleGround, showAlert, setShowAlert, 
            demo:'test'
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext);