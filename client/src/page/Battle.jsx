import React, {useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles';
import { Alert, ActionButton, GameInfo, PlayerInfo, Card } from '../components';
import { useGlobalContext } from '../context';

import { player01 as Player01Icon, player02 as Player02Icon, attack, attackSound, defense, defenseSound  } from '../assets';
import { playAudio } from '../utils/animation';



const Battle = () => {
    const {contract, showAlert, setShowAlert, gameData, updateGameData, setUpdateGameData, battleGround, setErrorMessage, player1Ref, player2Ref, battleEnded } = useGlobalContext();
    const { battleName } = useParams();
    const [player1, setPlayer1] = useState({});
    const [player2, setPlayer2] = useState({});   
    const [refresh, setRefresh] = useState(false) 

    const navigate = useNavigate();



    useEffect(() => {
        setRefresh(!refresh)
    }, [])



    useEffect(() => {
        const getPlayerInfo = async () => {
            console.log('fetching player stats');
            const wallet = localStorage.getItem('walletAddress').toLowerCase();
            try{
            //first initialize the player address variables for both player01 and player02
                let player01Address = null;
                let player02Address = null;
                console.log(wallet)
                console.log(gameData.activeBattle);
            //use if condition to find which players in activebattle match the current user walletaddress and set that player to player01
                if(gameData.activeBattle.players[0].toLowerCase() === wallet.toLowerCase()){
                    console.log('scenario one');
                    player01Address = gameData.activeBattle.players[0];
                    player02Address = gameData.activeBattle.players[1];
                }else{
                    console.log('scenario two')
                    player01Address = gameData.activeBattle.players[1];
                    player02Address = gameData.activeBattle.players[0];
                }
                console.log(player01Address);
                console.log('now getting your token')
            //use fetch the player01 token from the contract and set to variable p1TokenData
                const p1TokenData = await contract.getPlayerToken(player01Address)
                console.log('token received, now assigning each player their game stats')
            //now fetch full player data from contract for both player01 and player02 for the coming game
                const player01 = await contract.getPlayer(player01Address);
                const player02 = await contract.getPlayer(player02Address);

            //extract attack and defense strength for current user(player1) from player1 token
                const p1Att = p1TokenData.attackStrength.toNumber();
                const p1Def = p1TokenData.defenseStrength.toNumber();

            //now extract player health and mana for both players using player01 and player01 
                const p1H = player01.playerHealth.toNumber();
                const p1M = player01.playerMana.toNumber();
                const p2H = player02.playerHealth.toNumber();
                const p2M = player02.playerMana.toNumber(); 
                
            //finally set all data to state for both players
                setPlayer1({...player01, att: p1Att, def: p1Def, health: p1H, mana: p1M});
                setPlayer2({...player02, att: 'X', def: 'X', health: p2H, mana: p2M});

            }catch(error){
                setErrorMessage(error)
            } 

        }

        if(contract && gameData.activeBattle) getPlayerInfo();
    }, [updateGameData, gameData, contract, battleName]);




    const makeAMove = async (choice) => {
        playAudio(choice === 1 ? attackSound : defenseSound);
        try{
            await contract.attackOrDefendChoice(choice, battleName, {gasLimit : 200000});
            setShowAlert({
                status: true,
                type: 'info',
                message: `Initiating ${choice === 1 ? 'attack' : 'defense'}`
            })
        }catch(error){
            setErrorMessage(error);
        }
    };




    useEffect(() => {
        setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
        const timer = setTimeout(() => {
            console.log(battleEnded);
            if(!gameData?.activeBattle && battleEnded){
                 navigate('/create-battle');
            }
            
        }, [2000]);

        return () => clearTimeout(timer)
    }, []);






    return (

        <div className={`${styles.flexBetween} ${styles.gameContainer} ${battleGround}`}>
            { showAlert.status && <Alert type={showAlert.type} message={showAlert.message} /> }

            <PlayerInfo player={player2} playerIcon={Player02Icon} mt />

            <div className={`${styles.flexCenter} flex-col my-10`}>
                <Card 
                  card={player2}
                  title={player2.playerName}
                  cardRef={player2Ref}
                  playerTwo
                />

                <div className='flex items-center flex-row'>
                    <ActionButton 
                     imgUrl={attack}
                     handleClick={() => makeAMove(1)}
                     restStyles='mr-2 hover:border-yellow-400'
                    />

                    <Card 
                     card={player1}
                     title={player1.playerName}
                     cardRef={player1Ref}
                     restStyles
                    />

                    <ActionButton 
                     imgUrl={defense}
                     handleClick={() => makeAMove(2)}
                     restStyles='ml-6 hover:border-red-600'
                    />

                </div>
            </div>

            <PlayerInfo player={player1} playerIcon={Player01Icon}  />

            <GameInfo />
            
        </div>
        
    )
}

export default Battle