import React, {useState, useEffect} from 'react';
import { CustomInput, CustomButton, PageHOC } from '../components';
import { useNavigate } from 'react-router-dom';
import styles from '../styles';

import { useGlobalContext } from '../context';


const CreateBattle = () => {
  const {contract, battleName, setBattleName} = useGlobalContext;
  const navigate = useNavigate();


  const createBattle = () => {

  }


  return (
    <>
      <div className='flex flex-col mb-5'>
        <CustomInput 
          label='New Battle'
          placeholder='Enter Battle Name'
          value={battleName}
          handleValueChange={setBattleName}
        />

        <CustomButton 
          title='Create'
          handleClick={createBattle}
          restStyles='mt-6'
        />
      </div>
      <p className={styles.infoText} onClick={() => navigate('/join-battle')}> Or Join an existing battle </p>
    </>
  )
}

export default PageHOC (
    CreateBattle,
    <>Create A New Battle </>,
    <>Create your own battle and wait for other players to join</>
    );
