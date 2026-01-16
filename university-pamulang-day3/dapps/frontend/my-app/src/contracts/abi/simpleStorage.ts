export const SIMPLE_STORAGE_ABI = [
    {
        "inputs":[],
        "name": "getValue",
        "outputs": [{ "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "input": [
            { "internalType": "unint256", "name": "_value", "type": "unit256" }
        ],
        "name": "setValue",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];