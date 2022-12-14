import React from 'react';
import { useNavigate } from 'react-router-dom';

import { altlogo, hero3Img } from '../assets/';
import { useGlobalContext } from '../context';
import styles from '../styles';
import Alert from './Alert';

const PageHOC = (Component, title, description, hero) => () => {
    const { accountConnected, showAlert } = useGlobalContext();
    const navigate = useNavigate();

    return (
        <div className={styles.hocContainer}>
            { showAlert.status && <Alert type={showAlert.type} message={showAlert.message} /> }
            <div className={styles.hocContentBox}>
                <img className={styles.hocLogo} src={altlogo} alt='logo' onClick={() => navigate('/')} />

                <div className={styles.hocBodyWrapper}>
                    <div className='flex flex-row w-full'>
                        <h1 className={`flex ${styles.headText} `}> {title} </h1>
                    </div>

                    {accountConnected ? (
                        <p className={`${styles.normalText} my-10`}>You can Start a new Game or Join An Existing Game</p>
                    ):(
                        <p className={`${styles.normalText} my-10`}> {description} </p>
                    )
                        
                    }
                    <Component />
                </div>

                <p className={styles.footerText}>Developed By Signet Labs</p>
            </div>

            <div className='flex flex-1'>
                {hero}
            </div>
        </div>
    )
}

export default PageHOC;