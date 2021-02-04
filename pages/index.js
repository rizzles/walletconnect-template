import React, { useState, useEffect } from 'react';
import {
    Web3ReactProvider,
    useWeb3React,
    UnsupportedChainIdError,
} from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { formatEther } from '@ethersproject/units';
import { walletconnect } from '../connectors';

function getLibrary(provider) {
    const library = new Web3Provider(provider);
    library.pollingInterval = 12000;
    return library;
}

export default function () {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <App />
        </Web3ReactProvider>
    );
}

function Balance() {
    const { account, library, chainId } = useWeb3React();

    const [balance, setBalance] = useState();
    useEffect(() => {
        if (!!account && !!library) {
            let stale = false;

            library
                .getBalance(account)
                .then((balance) => {
                    if (!stale) {
                        setBalance(balance);
                    }
                })
                .catch(() => {
                    if (!stale) {
                        setBalance(null);
                    }
                });

            return () => {
                stale = true;
                setBalance(undefined);
            };
        }
    }, [account, library, chainId]);

    return (
        <>
            <span>Balance</span>
            <span role="img" aria-label="gold">
                💰
            </span>
            <span>
                {balance === null ? 'Error' : `${formatEther(balance)}`}
            </span>
        </>
    );
}

const App = () => {
    const context = useWeb3React();
    const {
        connector,
        library,
        chainId,
        account,
        activate,
        deactivate,
        active,
        error,
    } = context;
    const [activatingConnector, setActivatingConnector] = useState();

    useEffect(() => {
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined);
        }
    }, [activatingConnector, connector]);

    const currentConnector = walletconnect;
    const activating = currentConnector === activatingConnector;
    const connected = currentConnector === connector;
    const disabled = !!activatingConnector || connected || !!error;
    const name = 'WalletConnect';

    return (
        <>
            <button
                disabled={disabled}
                key={name}
                onClick={() => {
                    setActivatingConnector(currentConnector);
                    activate(walletconnect);
                }}
                type="button"
            >
                <div>
                    {activating && <p>Activating</p>}
                    {connected && (
                        <span role="img" aria-label="check">
                            ✅
                        </span>
                    )}
                </div>
                {name}
            </button>
            <Balance />
        </>
    );
};
