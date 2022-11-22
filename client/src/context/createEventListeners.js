import { ethers } from "ethers";
import { ABI } from "../contract";


//initialize AddNewEvent which will use the contract-provider and eventfilters to interract with events emmitted ty the contract
const AddNewEvent = ( eventFilter, provider, cb) => {
    provider.removeListener(eventFilter); //remove already existing event listeners to avoid multiple listening at the same time

    provider.on(eventFilter, (logs) => {
        const parsedLog = (new ethers.utils.Interface(ABI)).parseLog(logs);

        cb(parsedLog)
    })
}




export const createEventListeners = ({ summonedPlayer, setSummonedPlayer, navigate, contract, provider, walletAddress, setShowAlert, setUpdateGameData } ) => {

    //now to initialize the various event listeners

    const NewPlayerEventFilter = contract.filters.NewPlayer(); //get the newPlayer event filter from the contract

    //called AddNewEvent passing in the NewPlayerEventFilter so we are actively listening for this event emmitted by the contract
    AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
        console.log('New Player Created', args);
        if(walletAddress === args.owner){
            setShowAlert({
                status: true,
                type: 'success',
                message: `${args.name} has been registered successfully`
            })
            setSummonedPlayer(args._name);
            window.location.reload(false);
        }
    });



    const NewBattleEventFilter = contract.filters.NewBattle(); //get NewBattle event filter from the contract

    //called AddNewEvent passing in the newBattleEventFilter so we are actively listening for this event emmitted by the contract
    AddNewEvent(NewBattleEventFilter, provider, ({ args }) => {
        console.log('New Battle Started', args);
        //check to see if the current wallet address is a player in this battle, update game data and move them to the battleground 
        if( walletAddress.toLowerCase() === args.player1.toLowerCase() || walletAddress.toLowerCase() === args.player2.toLowerCase() ){
            navigate(`/battle/${args.battleName}`)
            console.log(args.battleName);
            setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);

            setShowAlert({
                status: true,
                type: 'success',
                message: 'Round 1: FIGHT!!!'
            })
        }
    });

}