import React from 'react';
import { useNavigate } from 'react-router-dom';

import { altlogo, heroImg } from '../assets/';
import { useGlobalContext } from '../context';
import styles from '../styles';
import Alert from './Alert';

const PageHOC = (Component, title, description) => () => {
    const { accountConnected, showAlert } = useGlobalContext();
    const navigate = useNavigate();

    return (
        <div className={styles.hocContainer}>
            { showAlert.status && <Alert type={showAlert.type} message={showAlert.message} /> }
            <div className={styles.hocContentBox}>
                <img className={styles.hocLogo} src={altlogo} alt='logo' onClick={() => navigate('/')} />

                <div className={styles.hocBodyWrapper}>
                    <div className='flex flex-row w-full'>
                        <h1 className={`flex ${styles.headText} head-text`}> {title} </h1>
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
                <img className='w-full xl:h-full object-cover' src={heroImg} alt='heroImg' />
            </div>
        </div>
    )
}

export default PageHOC;