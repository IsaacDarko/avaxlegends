import React, { useEffect, useState } from 'react';
import { CustomButton, GameLoad, PageHOC } from '../components';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context';
import styles from '../styles';



const JoinBattle = () => {
    const [waitBattle, setWaitBattle] = useState(false);
    const [walletAddress, setWalletAddress] = useState('')
    const { contract, gameData, setShowAlert, setBattleName, setErrorMessage } = useGlobalContext();
    const navigate = useNavigate();

    useEffect(() => {
        if(gameData?.activeBattle?.battleStatus === 1) navigate(`/battle/${gameData.activeBattle.name}`);
    }, [gameData]);


    const handleClick = async (battleName) => {
        console.log('running joinbattle handleclick')
        setBattleName(battleName);
        try {
            await contract.joinBattle(battleName, {gasLimit : 200000});
            setShowAlert({
                status: true,
                type: 'success',
                message: `Joining ${battleName}`
            })
        } catch (error) {
            setErrorMessage(error)
        }
    }


    //puts page on hold if you yourself have an active battle ongoing, so you can join any other pending battles
    useEffect(() => {
        const wallet = localStorage.getItem('walletAddress');
        setWalletAddress(wallet)
        console.log(wallet);
        console.log(gameData.pendingBattles);
        if (gameData?.activeBattle?.battleStatus === 0) {
            setWaitBattle(true);
        } else (
            setWaitBattle(false)
        )
    }, [gameData, contract])


    return (
        <>
            {waitBattle && <GameLoad />}
            <h2 className={styles.joinHeadText}> Available-Battles:</h2>

            <div className={styles.joinContainer}>
                {gameData.pendingBattles.length ? //conditional redering to filter through & display the appropriate pending battles
                    gameData.pendingBattles.filter((battle) => !battle.players.includes(walletAddress)) //filtering pending battles for ones not including current player
                        .map((battle, index) => (
                            <div key={battle.name + index} className={styles.flexBetween}>
                                <p className={styles.joinBattleTitle}>{index + 1}. {battle.name} </p>

                                <CustomButton
                                    title='Join'
                                    handleClick={() => { handleClick(battle.name) }}
                                />
                            </div>
                        )//then mapping though filtered battles to render them in individual divs for display
                        ) : (
                        <p className='text-white text-bold'>Reload the page to see new battles</p>
                    )
                }

            </div>

            <p className={styles.infoText} onClick={() => navigate('/create-battle')}>Or Create a New Battle </p>

        </>
    )
}

export default PageHOC(
    JoinBattle,
    <>Join An Ongoing Battle </>,
    <>You Choose Any From The List</>
);