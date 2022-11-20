import { ethers } from "ethers";
import { ABI } from "../contract";


const AddNewEvent = ( eventFilter, provider, cb) => {
    provider.removeListener(eventFilter); //remove already existing event listeners to avoid multiple listening at the same time

    provider.on(eventFilter, (logs) => {
        const parsedLog = (new ethers.utils.Interface(ABI)).parseLog(logs);

        cb(parsedLog)
    })
}

export const createEventListeners = ({ navigate, contract, provider, walletAddress, setShowAlert } ) => {
    const NewPlayerEventFilter = contract.filters.NewPlayer();

    AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
        console.log('New Player Created', args);

        if(walletAddress === args.owner){
            setShowAlert({
                status: true,
                type: 'success',
                message: 'Player has been registered successfully'
            })
        }
    })

}