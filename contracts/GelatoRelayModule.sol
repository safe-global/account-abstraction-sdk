// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import { GelatoRelayContext } from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";
import { GelatoRelayFeeCollector } from "@gelatonetwork/relay-context/contracts/GelatoRelayFeeCollector.sol";

interface GnosisSafe {
    /// @dev Allows a Module to execute a Safe transaction without any further confirmations.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModule(address to, uint256 value, bytes calldata data, Enum.Operation operation)
        external
        returns (bool success);
}

import { Enum } from "@gnosis.pm/safe-contracts/contracts/common/Enum.sol";

contract GelatoRelayModule is GelatoRelayContext {

    event ShowInput(address to, uint256 value, bytes data, uint256 fees);
    event ShowAddress(address collector);
    event ShowFee(uint256 chargedFee, uint256 fees, uint256 totalChargedFee);
    event ShowFeeToken(address feeToken);

    GnosisSafe safe;

    constructor(GnosisSafe safeInstance) {
        safe = safeInstance;
    }

    function relayTransaction(address to, uint256 value, bytes memory data, uint256 fees, signature)
        external
        returns (bool success)
    {
        // TO-DO: Signature from the signers MUST be checked 

        // PSEUDOCODE
        // const hash = kekkack(chainid, nonce, to, value, data, fee, safe, this)
        // ownerAddress = ecrecover(hash, signature)
        // require(safe.owners().includes(ownerAddress), "signer must be an owner")

        emit ShowInput(to, value, data, fees);

        // why is this returning 0x000...000?
        address feeCollector = _getFeeCollector();
        emit ShowAddress(feeCollector);

        uint256 chargedFee = _getFee();
        uint256 totalChargedFee = chargedFee + fees;
        emit ShowFee(chargedFee, fees, totalChargedFee);

        address chargedFeeToken = _getFeeToken();
        emit ShowFeeToken(chargedFeeToken);

        // Payment to relay
        // transfer(_getFeeCollector(), token, fees);
        require(safe.execTransactionFromModule(feeCollector, totalChargedFee, "", Enum.Operation.Call), "Could not execute payment to the relay");

        // Execute Safe transaction 
        require(safe.execTransactionFromModule(to, value, data, Enum.Operation.Call), "Could not execute transaction");

        success = true;
    }

    /*
    function transfer(address to, address token,  uint256 amount) private {
        if (token == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)) {
            // solium-disable-next-line security/no-send
            require(safe.execTransactionFromModule(to, amount, "", Enum.Operation.Call), "Could not execute ether transfer");
        } else {
            bytes memory data = abi.encodeWithSignature("transfer(address,uint256)", to, amount);
            require(safe.execTransactionFromModule(token, 0, data, Enum.Operation.Call), "Could not execute token transfer");
        }
    }
    */

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
