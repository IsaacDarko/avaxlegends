import { ethers } from "ethers";
import { defenseSound } from "../assets";
import { ABI } from "../contract";
import { playAudio, sparcle } from "../utils/animation";


//initialize AddNewEvent which will use the contract-provider and eventfilters to interract with events emmitted ty the contract
const AddNewEvent = ( eventFilter, provider, cb) => {
    provider.removeListener(eventFilter); //remove already existing event listeners to avoid multiple listening at the same time

    provider.on(eventFilter, (logs) => {
        const parsedLog = (new ethers.utils.Interface(ABI)).parseLog(logs);

        cb(parsedLog)
    })
}

const emptyAccount = '0x0000000000000000000000000000000000000000';


const getCoords = (cardRef) => {
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    return{
        pageX: (left + width) / 2,
        pageY: (top + height) / 2.25,
    }
}


export const createEventListeners = ({ player1Ref, player2Ref, setSummonedPlayer, navigate, contract, provider, setWalletAddress, walletAddress, setShowAlert, setUpdateGameData, setGameData, setBattleEnded } ) => {
    
    //now to initialize the various event listeners
    const NewPlayerEventFilter = contract.filters.NewPlayer(); //get the newPlayer event filter from the contract
    //called AddNewEvent passing in the NewPlayerEventFilter so we are actively listening for this event emmitted by the contract
    AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
        let name
        console.log('New Player Created', args);
        if(walletAddress === args.owner){
            setShowAlert({
                status: true,
                type: 'success',
                message: `${args.name} has been registered successfully`
            })
            setSummonedPlayer(args.name);
            name = args.name;
            console.log(name)
            localStorage.setItem('playerName', name);
            window.location.reload(false);
        }
    });



    const NewGameTokenEventFilter = contract.filters.NewGameToken(); //get NewBattle event filter from the contract
    //called AddNewEvent passing in the newBattleEventFilter so we are actively listening for this event emmitted by the contract
    AddNewEvent(NewGameTokenEventFilter, provider, ({ args }) => {
        const wallet = localStorage.getItem('walletAddress');
        console.log(wallet);

        console.log('New Game Token Created', args);

        if(wallet.toLowerCase() === args.owner.toLowerCase()){
            setShowAlert({
                status: true,
                type: 'success',
                message: 'Player game token has been registered successfully'
            })
            navigate('/create-battle')
        }
    });




    const NewBattleEventFilter = contract.filters.NewBattle(); //get NewBattle event filter from the contract
    //called AddNewEvent passing in the newBattleEventFilter so we are actively listening for this event emmitted by the contract
    AddNewEvent(NewBattleEventFilter, provider, ({ args }) => {
        const wallet = localStorage.getItem('walletAddress');
        console.log('New Battle Started', args);
        
        //check to see if the current wallet address is a player in this battle, update game data and move them to the battleground 
        if( wallet.toLowerCase() === args.player1.toLowerCase() || wallet.toLowerCase() === args.player2.toLowerCase() ){            
            setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
            setBattleEnded(false);
            navigate(`/battle/${args.battleName}`);
            setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1)
            setShowAlert({
                status: true,
                type: 'success',
                message: 'Round 1: FIGHT!!!'
            });

            const informer = () => {
                setShowAlert({
                    status: true,
                    type: 'info',
                    message: 'You Can Reload If Your Game Stats Are Not Displayed Yet'
                });
            }

            const timer = setTimeout(() => {
                informer()
            }, [7000]);
        }
        setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
        setBattleEnded(false);

    });



    const battleMoveEventFilter = contract.filters.BattleMove(); //get BattleMove event filter from the contract
    //called AddNewEvent passing in the battleMoveEventFilter so we are actively listening for this event when emmitted by the contract
    AddNewEvent(battleMoveEventFilter, provider, ({ args }) => {
        console.log('Battle Move Initiated', args);
    });



    const roundEndedEventFilter = contract.filters.RoundEnded();//get RoundEnded event filter from the contract and assigning to roundEndedEventFilter
    // called AddNewEvent passing in the roundEndedEventFilter so we are actively listening for this event when emmitted by the contract
    AddNewEvent(roundEndedEventFilter, provider, ({ args }) => {
        const wallet = localStorage.getItem('walletAddress');
        setWalletAddress(wallet);
        console.log('round ended', args, walletAddress);
        
        for(let i = 0; i < args.damagedPlayers.length; i += 1){
            if(args.damagedPlayers[i] !== emptyAccount){
                if(args.damagedPlayers[i] === walletAddress){
                    sparcle(getCoords(player1Ref))
                    
                }else if(args.damagedPlayers[i] !== walletAddress){
                    sparcle(getCoords(player2Ref))
                    
                }
                
            }else{
                playAudio(defenseSound);
                
            }
        }        
        setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1)

    });


    
    const battleEndedEventFilter = contract.filters.BattleEnded();//get BattleEnded event filter from the contract and assigning to battleEndedEventFilter
    // called AddNewEvent passing in the battleEndedEventFilter so we are actively listening for this event when emmitted by the contract
    AddNewEvent(battleEndedEventFilter, provider, ({ args }) => {
        const wallet = localStorage.getItem('walletAddress');
        if(wallet.toLowerCase() === args.winner.toLowerCase()){
            console.log('Battle ended', args, wallet);
            setGameData({ player:[], pendingBattles:[], activeBattle: null });
            
            setShowAlert({
                status: true,
                type: 'success',
                message: 'You Won'
            })
                  
        }else if(wallet.toLowerCase() === args.loser.toLowerCase()){
            console.log('Battle ended', args, wallet);
            setGameData({ player:[], pendingBattles:[], activeBattle: null });
            
            setShowAlert({
                status: true,
                type: 'failure',
                message: 'You lost'
            })
           
        }
        setGameData({ player:[], pendingBattles:[], activeBattle: null });
        setShowAlert({
            status: true,
            type: `${wallet.toLowerCase() === args.winner.toLowerCase() ? 'success' : 'failure'}`,
            message: `The Battle Was Ended : ${
                wallet.toLowerCase() === args.winner.toLowerCase() ? 'You Won' : 'You Lost'}`
        })
        setGameData({ player:[], pendingBattles:[], activeBattle: null });
        setBattleEnded(true);    
        navigate('/')  
    });

}