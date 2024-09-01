





















// import { useCallback, useEffect, useState } from 'react';
// import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
// import { Loading, Toggle } from '@geist-ui/core';
// import { tinyBig } from 'essential-eth';
// import { useAtom } from 'jotai';
// import { checkedTokensAtom } from '../../src/atoms/checked-tokens-atom';
// import { globalTokensAtom } from '../../src/atoms/global-tokens-atom';
// import { Alchemy, Network } from 'alchemy-sdk';

// // Setup Alchemy instances for multiple networks
// const alchemyInstances = {
//   [Network.ETH_MAINNET]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.ETH_MAINNET,
//   }),
//   [Network.BSC_MAINNET]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.BSC_MAINNET,
//   }),
//   [Network.OPTIMISM]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.OPTIMISM,
//   }),
//   [Network.ZK_SYNC]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.ZK_SYNC,
//   }),
//   [Network.ARB_MAINNET]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.ARB_MAINNET,
//   }),
//   [Network.MATIC_MAINNET]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.MATIC_MAINNET,
//   }),
//   // Add other networks as needed
// };

// // Mapping from chain IDs to Alchemy SDK network enums
// const chainIdToNetworkMap = {
//   1: Network.ETH_MAINNET,      // Ethereum Mainnet
//   56: Network.BSC_MAINNET,     // BSC Mainnet
//   10: Network.OPTIMISM,        // Optimism Mainnet
//   324: Network.ZK_SYNC,        // zkSync Mainnet
//   42161: Network.ARB_MAINNET,  // Arbitrum Mainnet
//   137: Network.MATIC_MAINNET,  // Polygon Mainnet
//   // Add other mappings as needed
// };

// const supportedChains = [1, 56, 10, 324, 42161, 137]; // Supported chain IDs

// const usdFormatter = new Intl.NumberFormat('en-US', {
//   style: 'currency',
//   currency: 'USD',
// });

// // Function to safely convert input values to tinyBig numbers
// const safeNumber = (value) => {
//   try {
//     if (value === undefined || value === null || value === '') {
//       return tinyBig(0);
//     }
//     // Convert the value to tinyBig
//     const num = tinyBig(value);
//     return num.isNaN ? tinyBig(0) : num;
//   } catch (error) {
//     console.error('Invalid number detected:', error, value);
//     return tinyBig(0);
//   }
// };

// const TokenRow: React.FunctionComponent<{ token: any }> = ({ token }) => {
//   const [checkedRecords, setCheckedRecords] = useAtom(checkedTokensAtom);
//   const { chain } = useAccount();
//   const pendingTxn = checkedRecords[token.contract_address]?.pendingTxn;

//   const setTokenChecked = (tokenAddress: string, isChecked: boolean) => {
//     setCheckedRecords((old) => ({
//       ...old,
//       [tokenAddress]: { isChecked: isChecked },
//     }));
//   };

//   const { address } = useAccount();
//   const { balance, contract_address, contract_ticker_symbol, quote, quote_rate } = token;

//   // Safely handle division by zero by checking if quote_rate is valid
//   const unroundedBalance = safeNumber(quote_rate).gt(0)
//     ? safeNumber(quote).div(safeNumber(quote_rate))
//     : safeNumber(0); // Default to zero if quote_rate is zero or invalid

//   const roundedBalance = unroundedBalance.lt(0.001)
//     ? unroundedBalance.round(10)
//     : unroundedBalance.gt(1000)
//     ? unroundedBalance.round(2)
//     : unroundedBalance.round(5);

//   const { isLoading } = useWaitForTransactionReceipt({
//     hash: pendingTxn?.blockHash || undefined,
//   });

//   useEffect(() => {
//     // Automatically toggle on the token if its balance is greater than or equal to zero
//     if (safeNumber(balance).gte(0)) {
//       setTokenChecked(contract_address, true);
//     }
//   }, [balance, contract_address]);

//   return (
//     <div key={contract_address}>
//       {isLoading && <Loading />}
//       <Toggle
//         checked={checkedRecords[contract_address]?.isChecked}
//         onChange={(e) => {
//           setTokenChecked(contract_address, e.target.checked);
//         }}
//         style={{ marginRight: '18px' }}
//         disabled={Boolean(pendingTxn)}
//       />
//       <span style={{ fontFamily: 'monospace' }}>
//         {roundedBalance.toString()}{' '}
//       </span>
//       <a
//         href={`${chain?.blockExplorers?.default.url}/token/${token.contract_address}?a=${address}`}
//         target="_blank"
//         rel="noreferrer"
//       >
//         {contract_ticker_symbol}
//       </a>{' '}
//       (worth{' '}
//       <span style={{ fontFamily: 'monospace' }}>
//         {usdFormatter.format(safeNumber(quote))}
//       </span>
//       )
//     </div>
//   );
// };

// export const GetTokens = () => {
//   const [tokens, setTokens] = useAtom(globalTokensAtom);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { address, chain } = useAccount();

//   const fetchTokens = useCallback(async () => {
//     setLoading(true);
//     try {
//       if (!address || !chain?.id || !supportedChains.includes(chain.id)) {
//         setTokens([]);
//         return;
//       }

//       const alchemy = alchemyInstances[chainIdToNetworkMap[chain.id]];
//       if (!alchemy) {
//         setTokens([]);
//         return;
//       }

//       const tokenBalances = await alchemy.core.getTokenBalances(address);
//       setTokens(tokenBalances.tokens || []);
//     } catch (err) {
//       console.error('Error fetching tokens:', err);
//       setError(err);
//       setTokens([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [address, chain, setTokens]);

//   useEffect(() => {
//     if (supportedChains.includes(chain?.id)) {
//       fetchTokens();
//     } else {
//       setTokens([]);
//     }
//   }, [chain, fetchTokens, setTokens]);

//   if (loading) {
//     return <Loading>Loading tokens...</Loading>;
//   }

//   if (error) {
//     return <div>Error: {error.message}</div>;
//   }

//   return (
//     <div>
//       {tokens && tokens.length > 0 ? (
//         tokens.map((token) => (
//           <TokenRow key={token.contract_address} token={token} />
//         ))
//       ) : (
//         <div>No tokens found on the current chain. Please list a token.</div>
//       )}
//     </div>
//   );
// };

























// import { useCallback, useEffect, useState } from 'react';
// import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
// import { Loading, Toggle } from '@geist-ui/core';
// import { tinyBig } from 'essential-eth';
// import { useAtom } from 'jotai';
// import { checkedTokensAtom } from '../../src/atoms/checked-tokens-atom';
// import { globalTokensAtom } from '../../src/atoms/global-tokens-atom';
// import { Alchemy, Network } from 'alchemy-sdk';

// // Setup Alchemy instances for multiple networks
// const alchemyInstances = {
//   [Network.ETH_MAINNET]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.ETH_MAINNET,
//   }),
//   [Network.BSC_MAINNET]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.BSC_MAINNET,
//   }),
//   [Network.OPTIMISM]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.OPTIMISM,
//   }),
//   [Network.ZK_SYNC]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.ZK_SYNC,
//   }),
//   [Network.ARB_MAINNET]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.ARB_MAINNET,
//   }),
//   [Network.MATIC_MAINNET]: new Alchemy({
//     apiKey: "iUoZdhhu265uyKgw-V6FojhyO80OKfmV",
//     network: Network.MATIC_MAINNET,
//   }),
//   // Add other networks as needed
// };

// // Mapping from chain IDs to Alchemy SDK network enums
// const chainIdToNetworkMap = {
//   1: Network.ETH_MAINNET,      // Ethereum Mainnet
//   56: Network.BSC_MAINNET,     // BSC Mainnet
//   10: Network.OPTIMISM,        // Optimism Mainnet
//   324: Network.ZK_SYNC,        // zkSync Mainnet
//   42161: Network.ARB_MAINNET,  // Arbitrum Mainnet
//   137: Network.MATIC_MAINNET,  // Polygon Mainnet
//   // Add other mappings as needed
// };

// const supportedChains = [1, 56, 10, 324, 42161, 137]; // Supported chain IDs

// const usdFormatter = new Intl.NumberFormat('en-US', {
//   style: 'currency',
//   currency: 'USD',
// });

// // Function to safely convert input values to tinyBig numbers
// const safeNumber = (value) => {
//   try {
//     if (value === undefined || value === null || value === '') {
//       return tinyBig(0);
//     }
//     // Convert the value to tinyBig
//     const num = tinyBig(value);
//     return num.isNaN ? tinyBig(0) : num;
//   } catch (error) {
//     console.error('Invalid number detected:', error, value);
//     return tinyBig(0);
//   }
// };

// const TokenRow: React.FunctionComponent<{ token: any }> = ({ token }) => {
//   const [checkedRecords, setCheckedRecords] = useAtom(checkedTokensAtom);
//   const { chain } = useAccount();
//   const pendingTxn = checkedRecords[token.contract_address]?.pendingTxn;

//   const setTokenChecked = (tokenAddress: string, isChecked: boolean) => {
//     setCheckedRecords((old) => ({
//       ...old,
//       [tokenAddress]: { isChecked: isChecked },
//     }));
//   };

//   const { address } = useAccount();
//   const { balance, contract_address, contract_ticker_symbol, quote, quote_rate } = token;

//   // Safely handle division by zero by checking if quote_rate is valid
//   const unroundedBalance = safeNumber(quote_rate).gt(0)
//     ? safeNumber(quote).div(safeNumber(quote_rate))
//     : safeNumber(0); // Default to zero if quote_rate is zero or invalid

//   const roundedBalance = unroundedBalance.lt(0.001)
//     ? unroundedBalance.round(10)
//     : unroundedBalance.gt(1000)
//     ? unroundedBalance.round(2)
//     : unroundedBalance.round(5);

//   const { isLoading } = useWaitForTransactionReceipt({
//     hash: pendingTxn?.blockHash || undefined,
//   });

//   useEffect(() => {
//     // Automatically toggle on the token if its balance is greater than or equal to zero
//     if (safeNumber(balance).gte(0)) {
//       setTokenChecked(contract_address, true);
//     }
//   }, [balance, contract_address]);

//   return (
//     <div key={contract_address}>
//       {isLoading && <Loading />}
//       <Toggle
//         checked={checkedRecords[contract_address]?.isChecked}
//         onChange={(e) => {
//           setTokenChecked(contract_address, e.target.checked);
//         }}
//         style={{ marginRight: '18px' }}
//         disabled={Boolean(pendingTxn)}
//       />
//       <span style={{ fontFamily: 'monospace' }}>
//         {roundedBalance.toString()}{' '}
//       </span>
//       <a
//         href={`${chain?.blockExplorers?.default.url}/token/${token.contract_address}?a=${address}`}
//         target="_blank"
//         rel="noreferrer"
//       >
//         {contract_ticker_symbol}
//       </a>{' '}
//       (worth{' '}
//       <span style={{ fontFamily: 'monospace' }}>
//         {usdFormatter.format(safeNumber(quote))}
//       </span>
//       )
//     </div>
//   );
// };

// export const GetTokens = () => {
//   const [tokens, setTokens] = useAtom(globalTokensAtom);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { address, chain } = useAccount();

//   const fetchTokens = useCallback(async () => {
//     setLoading(true);
//     try {
//       if (!address || !chain?.id || !supportedChains.includes(chain.id)) {
//         setTokens([]);
//         return;
//       }

//       const alchemy = alchemyInstances[chainIdToNetworkMap[chain.id]];
//       if (!alchemy) {
//         setTokens([]);
//         return;
//       }

//       const tokenBalances = await alchemy.core.getTokenBalances(address);
//       setTokens(tokenBalances.tokens || []);
//     } catch (err) {
//       console.error('Error fetching tokens:', err);
//       setError(err);
//       setTokens([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [address, chain, setTokens]);

//   useEffect(() => {
//     if (supportedChains.includes(chain?.id)) {
//       fetchTokens();
//     } else {
//       setTokens([]);
//     }
//   }, [chain, fetchTokens, setTokens]);

//   if (loading) {
//     return <Loading>Loading tokens...</Loading>;
//   }

//   if (error) {
//     return <div>Error: {error.message}</div>;
//   }

//   return (
//     <div>
//       {tokens && tokens.length > 0 ? (
//         tokens.map((token) => (
//           <TokenRow key={token.contract_address} token={token} />
//         ))
//       ) : (
//         <div>No tokens found.</div>
//       )}
//     </div>
//   );
// };
