export function dataReducer(state = {}, action: any) {
    switch (action.type) {
        case 'SET_DATA':
            return action.payload
        default:
            return state
    }
}