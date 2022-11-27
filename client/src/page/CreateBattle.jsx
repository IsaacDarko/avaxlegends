import React, {useState, useEffect} from 'react';
import { CustomInput, CustomButton, GameLoad, PageHOC } from '../components';
import { hero3Img } from '../assets/';
import { useNavigate } from 'react-router-dom';
import styles from '../styles';

import { useGlobalContext } from '../context';


const CreateBattle = () => {
  const [waitBattle, setWaitBattle] = useState(false)
  const { walletAddress, setErrorMessage, contract, battleName, setBattleName, gameData, battleEnded } = useGlobalContext();
  const navigate = useNavigate();


  const handleCreateBattle = async () => {
    if(!battleName || !battleName.trim()) return null;
    try{
      await contract.createBattle(battleName, {gasLimit : 200000})
      setWaitBattle(true)
    }catch(error){
      setErrorMessage(error)
    }
  }



  
  /*useEffect(() =>{
    if(gameData?.activeBattle?.battleStatus === 1 && battleEnded === true){
      window.location.reload(false);
      setBattleEnded(false)
    }
    else if(gameData?.activeBattle?.battleStatus === 1){
      navigate(`/battle/${gameData.activeBattle.name}`);
    }else if(gameData?.activeBattle?.battleStatus === 0){
      setWaitBattle(true);
    }else(
      setWaitBattle(false)
    )
  }, [gameData, contract, walletAddress, battleEnded]);
  */




    useEffect(() => {
      console.log(battleEnded);
      if (gameData?.activeBattle?.battleStatus === 1 && battleEnded === false) {
        navigate(`/battle/${gameData.activeBattle.name}`);
      } else if (gameData?.activeBattle?.battleStatus === 0) {
        setWaitBattle(true);
      }
    }, [gameData]);




  return (
    <>
      { waitBattle &&  <GameLoad /> }

      <div className='flex flex-col mb-5'>
        <CustomInput 
          label='New Battle'
          placeholder='Enter Battle Name'
          value={battleName}
          handleValueChange={setBattleName}
        />

        <CustomButton 
          title='Create'
          handleClick={handleCreateBattle}
          restStyles='mt-6'
        />
      </div>
      <p className={styles.inforText} onClick={() => navigate('/join-battle')}> Or Join an existing battle </p>
    </>
  )

}

export default PageHOC (
    CreateBattle,
    <>Create A New Battle </>,
    <>Create your own battle and wait for other players to join</>,
    <img className='w-full xl:h-full object-cover' src={hero3Img} alt='heroImg' />
);
