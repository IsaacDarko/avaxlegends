import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHOC, CustomInput, CustomButton } from '../components';
import { useGlobalContext } from '../context';
import styles from '../styles';


//Main app entry point(homepage)
const Home = () => {
  const navigate = useNavigate();
  const[playerName, setPlayerName] = useState('');
  const {summonedPlayer, contract, walletAddress, setShowAlert, updateCurrentWalletAddress} = useGlobalContext('');

  //handles the add-player functionality by calling the isPlayer function from the contract
  const handleClick = async () => {
    try{
      const wallet = localStorage.getItem('walletAddress');
      console.log(contract);
      console.log(walletAddress);
      //check if the current wallet already has a player registered
      const playerExists = await contract.isPlayer(wallet);
      if(!playerExists){
        await contract.registerPlayer(playerName, playerName);
        setShowAlert({
          status:true,
          type:'info',
          message: `${playerName} is being summoned`
        })
        console.log('done registering');
      }else{
        console.log('Player is registered already');
      }
      
    }catch(error){
      console.log(error);
      setShowAlert({
        status:true,
        type:'failure',
        message: "Something went wrong"
      })
    }
  }



  useEffect(() => {
    console.log(walletAddress);
    const checkPlayerToken = async () => {
      const playerExists = await contract.isPlayer(walletAddress);
      const pTokenExists = await contract.isPlayerToken(walletAddress);
      console.log(playerExists);
      console.log(pTokenExists);
      if(playerExists && pTokenExists)  navigate('/create-battle');
    }
    
    checkPlayerToken();
  }, [contract])



  
  
  
  return (

    <div className='flex flex-col'>
    {/*custom reusable input component */}
      <CustomInput 
        label="Name" 
        placeholder="Enter your player name" 
        value={playerName} 
        handleValueChange={setPlayerName}
      />

    {/*custom reusable button component */}
      <CustomButton 
        title= 'Register' 
        handleClick={ handleClick }
        restStyles='mt-6'
      />

    </div>
  )
}; 
//wrapping the component in the HOC before exporting
export default PageHOC (
  Home,
  <>WELCOME TO AVAX LEGENDS <br/> A Web3 NFT Game</>,
  <>Please Connect Your Wallet To Start Playing</>
  );