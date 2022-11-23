import React, {useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles';
import { Alert, ActionButton, GameInfo, PlayerInfo, Card } from '../components';
import { useGlobalContext } from '../context';

import { player01 as Player01Icon, player02 as Player02Icon, attack, attackSound, defense, defenseSound  } from '../assets';
import { playAudio } from '../utils/animation';



const Battle = () => {
    const { walletAddress, contract, showAlert, setShowAlert, gameData, battleGround } = useGlobalContext();
    const [player1, setPlayer1] = useState({});
    const [player2, setPlayer2] = useState({});
    const navigate = useNavigate();
    const { battleName } = useParams();


    useEffect(() => {
        const getPlayerInfo = async () => {
            const wallet = localStorage.getItem('walletAddress').toLowerCase();
            try{
            //first initialize the player address variables for both player01 and player02
                let player01Address = null;
                let player02Address = null;
                console.log(wallet)
                console.log(gameData.activeBattle);
            //use if condition to find which players in activebattle match the current user walletaddress and set that player to player01
                if(gameData.activeBattle.players[0].toLowerCase() === wallet){
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
                console.log(error)
            } 

        }

        if(contract && gameData.activeBattle) getPlayerInfo();
    }, [contract, battleName, gameData])



    return (

        <div className={`${styles.flexBetween} ${styles.gameContainer} ${battleGround}`}>
            { showAlert.status && <Alert type={showAlert.type} message={showAlert.message} /> }

            <PlayerInfo player={player2} playerIcon={Player02Icon} mt />

            <div className={`${styles.flexCenter} flex-col my-10`}>
                <Card 
                  card={player2}
                  title={player2.playerName}
                  cardRef=''
                  playerTwo
                />

                <div className='flex items-center flex-row'>
                    <ActionButton 
                     imgUrl={attack}
                     handleClick={() => {}}
                     restStyles='mr-2 hover:border-yellow-400'
                    />

                    <Card 
                        card={player1}
                        title={player1.playerName}
                        cardRef=''
                        restStyles
                    />

                    <ActionButton 
                     imgUrl={defense}
                     handleClick={() => {}}
                     restStyles='ml-6 hover:border-red-600'
                    />

                </div>
            </div>

            <PlayerInfo player={player1} playerIcon={Player01Icon} mt />

            <GameInfo />
            
        </div>
        
    )
}

export default Battle