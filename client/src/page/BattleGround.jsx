import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../components';
import styles from '../styles';
import { battlegrounds } from '../assets';
import { useGlobalContext } from '../context';

const BattleGround = () => {
    const { setBattleGround, showAlert, setShowAlert } = useGlobalContext()
    const navigate = useNavigate();

    const handleBattlegroundChoice = (ground) => {
        setBattleGround(ground.id)

        localStorage.setItem('battleground', ground.id);

        setShowAlert({
            status: true,
            type: 'info',
            message: `${ground.name} is battle ready`
        })

        setTimeout(() => {
            navigate(-1);
        }, 2000)
    }


    return (

        <div className={`${styles.flexCenter} ${styles.battlegroundContainer} `}>
            { showAlert.status && <Alert type={showAlert.type} message={showAlert.message} /> }

            <h1 className={`${styles.headText} text-center`}>
                Choose Your <span className='text-siteViolet'>Battle</span> Ground
            </h1>
            <div className={`${styles.battleGroundsWrapper} ${styles.flexCenter} `}>
                { battlegrounds.map((ground) => (
                    <div 
                      key={ground.id}
                      className={`${styles.battleGroundCard} ${styles.flexCenter} `}
                      onClick={() => handleBattlegroundChoice(ground)}
                    >
                        <img src={ground.image} alt='ground-img' className={styles.battleGroundCardImg} />
                        <div className='info absolute'>
                            <p className={styles.battleGroundCardText}> {ground.name} </p>
                        </div>
                    </div>
                ))}

            </div>

        </div>

    )
}

export default BattleGround;
