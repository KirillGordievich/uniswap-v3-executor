// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.7.6;

/// @title Mock for inspecting native EVM functionality
/// @notice Thin wrapper for Solidity methods where all methods are public and pure
contract EvmMock {
    /// @notice Return the passed uint256 value. Used to check for uint256 bounds
    /// @param value Original value
    /// @return Original value
    function identityUint256(uint256 value) public pure returns (uint256) {
        return value;
    }

    /// @notice Return the passed int256 value. Used to check for int256 bounds
    /// @param value Original value
    /// @return Original value
    function identityInt256(int256 value) public pure returns (int256) {
        return value;
    }

    /// @notice Check if the value is a uint256
    /// @param value Check value
    /// @return True if fits into uint128 and false otherwise
    function isUint128(uint256 value) public pure returns (bool) {
        return uint128(value) == value;
    }

    /// @notice Check if the value is a uint160
    /// @param value Check value
    /// @return True if fits into uint160 and false otherwise
    function isUint160(uint256 value) public pure returns (bool) {
        return uint160(value) == value;
    }

    /// @notice Check if the value is a int128
    /// @param value Check value
    /// @return True if fits into int128 and false otherwise
    function isInt128(int256 value) public pure returns (bool) {
        return int128(value) == value;
    }

    /// @notice Cast a value to a uint128
    /// @param value Original value
    /// @return Cast value
    function toUint128(int256 value) public pure returns (uint128) {
        return uint128(value);
    }

    /// @notice Cast a value to a int256
    /// @param value Original value
    /// @return Cast value
    function toUint160(int256 value) public pure returns (uint160) {
        return uint160(value);
    }

    /// @notice Multiply two values and cast them to a uint256
    /// @param x Multiplicand
    /// @param y Multiplier
    /// @return Cast product
    function mulInt256(int256 x, int256 y) public pure returns (uint256) {
        return uint256(x * y);
    }
}
