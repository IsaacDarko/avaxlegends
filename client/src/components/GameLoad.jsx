import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from './CustomButton';
import { useGlobalContext } from '../context';
import { player01, player02 } from '../assets';
import styles from '../styles';



const GameLoad = () => {
    const navigate = useNavigate();
    const { walletAddress, summonedPlayer } = useGlobalContext();

    return (

        <div className={`${styles.flexBetween} ${styles.gameLoadContainer}`}>
            <div className={styles.gameLoadBtnBox}>
                <CustomButton 
                 title='Choose Battleground'
                 handleClick={() => navigate('/battlegrounds')}
                 restStyles='mt-6'
                />
            </div>
            <div className={`flex-1 flex-col ${styles.flexCenter}`}>
                <h1 className={`${styles.headText} text-center`}>Waiting For a Worthy <br /> Opponent...</h1>
                <p className={styles.gameLoadText}>You can choose your prefered battleground while you wait.</p>

                <div className={styles.gameLoadPlayersBox}>
                    <div className={`${styles.flexCenter} flex-col`}>
                        <img src={player01} className={styles.gameLoadPlayerImg} />
                        <p className={styles.gameLoadPlayerText}>{walletAddress.slice(0, 30)}</p>
                    </div>

                    <h2 className={styles.gameLoadVS}>VS</h2>

                        <div className={`${styles.flexCenter} flex-col`}>
                            <img src={player02} className={styles.gameLoadPlayerImg} />
                            <h2 className={styles.gameLoadPlayerText}>?????????????????????????????</h2>
                        </div>
                    </div>
            </div>
        </div>

    )
}

export default GameLoad