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
    const [showAlert, setShowAlert] = useState({ status: false, type: 'info', message: '' });

    const [battleName, setBattleName] = useState('');

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
                setWalletAddress(accounts[0]);
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
            const wallet = localStorage.getItem('walletAddress');
            setWalletAddress(wallet)
            createEventListeners({ navigate, contract, provider, walletAddress, setShowAlert });
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
    }, [showAlert])



    return(
        <GlobalContext.Provider value={{
            contract, provider, updateCurrentWalletAddress,
            walletAddress, accountConnected, checkWallet,
            showAlert, setShowAlert,
            battleName, setBattleName,
            demo:'test'
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext);